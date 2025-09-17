import type { AxiosInstance } from 'axios'
import m3u8stream from 'm3u8stream'
import type { Transcoding } from './info.js'
import { SoundCloudError, TrackNotFoundError, InvalidTrackError } from './info.js'
import { handleRequestError, appendURL } from './util.js'
import { STREAMING_PROTOCOLS } from './protocols.js'
import getTrackInfo from './info.js'

/**
 * Custom error for download operations
 */
export class DownloadError extends SoundCloudError {
  constructor(message: string, public readonly trackId?: number) {
    super(message, 'DOWNLOAD_ERROR')
    this.name = 'DownloadError'
  }
}

/**
 * Custom error for media validation
 */
export class MediaValidationError extends SoundCloudError {
  constructor(message: string = 'Invalid media object provided') {
    super(message, 'MEDIA_VALIDATION_ERROR')
    this.name = 'MediaValidationError'
  }
}

/**
 * Default request headers for SoundCloud API
 */
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://soundcloud.com/',
} as const

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 30000 as const

/**
 * SoundCloud API base URL
 */
const API_BASE_URL = 'https://api-v2.soundcloud.com' as const

/**
 * Validates media transcoding object
 */
function validateMedia(media: Transcoding): boolean {
  return Boolean(
    media?.url &&
    media?.format?.protocol &&
    media?.format?.mime_type &&
    !media?.snipped // Exclude snipped previews
  )
}

/**
 * Retrieves the actual media URL from SoundCloud API
 */
export async function getMediaURL(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<string> {
  if (!url.trim()) {
    throw new SoundCloudError('Media URL cannot be empty')
  }

  try {
    const requestURL = appendURL(url, 'client_id', clientID)
    const response = await axiosInstance.get<{ url: string }>(requestURL, {
      headers: DEFAULT_HEADERS,
      withCredentials: true,
      timeout: REQUEST_TIMEOUT,
    })

    if (!response.data?.url) {
      throw new DownloadError(
        `Invalid response from SoundCloud API - missing media URL: ${url}`
      )
    }

    return response.data.url
  } catch (error) {
    throw handleRequestError(error, `Failed to get media URL: ${url}`)
  }
}

/**
 * Creates a progressive stream from media URL
 */
export async function getProgressiveStream(
  mediaUrl: string,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream> {
  if (!mediaUrl.trim()) {
    throw new SoundCloudError('Media URL cannot be empty')
  }

  try {
    const response = await axiosInstance.get(mediaUrl, {
      withCredentials: true,
      responseType: 'stream',
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Range': 'bytes=0-',
        'Accept': 'audio/*,*/*;q=0.9',
      },
    })

    return response.data as NodeJS.ReadableStream
  } catch (error) {
    throw handleRequestError(error, `Failed to create progressive stream: ${mediaUrl}`)
  }
}

/**
 * Creates an HLS stream from media URL
 */
export function getHLSStream(mediaUrl: string): m3u8stream.Stream {
  if (!mediaUrl.trim()) {
    throw new SoundCloudError('Media URL cannot be empty')
  }

  try {
    return m3u8stream(mediaUrl, {
      requestOptions: {
        headers: DEFAULT_HEADERS,
        timeout: REQUEST_TIMEOUT,
      },
    })
  } catch (error) {
    throw new DownloadError(
      `Failed to create HLS stream: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Stream handler functions interface
 */
interface StreamHandlers {
  getMediaURL: typeof getMediaURL
  getProgressiveStream: typeof getProgressiveStream
  getHLSStream: typeof getHLSStream
}

/**
 * Creates a stream from URL with dependency injection for better testability
 */
export async function fromURLBase(
  url: string,
  clientID: string,
  handlers: StreamHandlers,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  if (!url.trim()) {
    throw new SoundCloudError('URL cannot be empty')
  }

  try {
    const mediaUrl = await handlers.getMediaURL(url, clientID, axiosInstance)

    // Determine stream type based on URL pattern
    if (url.includes('/progressive')) {
      return await handlers.getProgressiveStream(mediaUrl, axiosInstance)
    }

    return handlers.getHLSStream(mediaUrl)
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    throw handleRequestError(error, `Failed to create stream from URL: ${url}`)
  }
}

/**
 * Creates a stream from URL using default handlers
 */
export async function fromURL(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  const handlers: StreamHandlers = {
    getMediaURL,
    getProgressiveStream,
    getHLSStream,
  }

  return fromURLBase(url, clientID, handlers, axiosInstance)
}

/**
 * Creates a stream from media object with dependency injection
 */
export async function fromMediaObjBase(
  media: Transcoding,
  clientID: string,
  handlers: StreamHandlers & { fromURL: typeof fromURL },
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  if (!validateMedia(media)) {
    throw new MediaValidationError(
      'Media object must have url, format.protocol, format.mime_type, and must not be snipped'
    )
  }

  try {
    return await handlers.fromURL(media.url, clientID, axiosInstance)
  } catch (error) {
    throw handleRequestError(error, `Failed to create stream from media object: ${media.url}`)
  }
}

/**
 * Creates a stream from media object using default handlers
 */
export async function fromMediaObj(
  media: Transcoding,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  const handlers = {
    getMediaURL,
    getProgressiveStream,
    getHLSStream,
    fromURL,
  }

  return fromMediaObjBase(media, clientID, handlers, axiosInstance)
}

/**
 * Downloads track using the official download API
 */
export async function fromDownloadLink(
  id: number,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new DownloadError('Invalid track ID provided')
  }

  try {
    const downloadURL = appendURL(`${API_BASE_URL}/tracks/${id}/download`, 'client_id', clientID)
    
    const response = await axiosInstance.get<{ redirectUri: string }>(downloadURL, {
      timeout: REQUEST_TIMEOUT,
    })

    if (!response.data?.redirectUri) {
      throw new DownloadError('No download redirect URI provided', id)
    }

    const streamResponse = await axiosInstance.get(response.data.redirectUri, {
      responseType: 'stream',
      timeout: REQUEST_TIMEOUT,
    })

    return streamResponse.data as NodeJS.ReadableStream
  } catch (error) {
    throw handleRequestError(error, `Failed to download track via download link: ${id}`)
  }
}

/**
 * Downloads a track with fallback mechanisms
 */
export async function download(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance,
  useDownloadLink = true
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  if (!url.trim()) {
    throw new SoundCloudError('URL cannot be empty')
  }

  try {
    const trackInfo = await getTrackInfo(url, clientID, axiosInstance)

    if (!trackInfo.media?.transcodings?.length) {
      throw new InvalidTrackError(url)
    }

    // Try official download link first if available and requested
    if (useDownloadLink && trackInfo.downloadable && trackInfo.id) {
      try {
        return await fromDownloadLink(trackInfo.id, clientID, axiosInstance)
      } catch (downloadError) {
        // Log the error but continue with streaming fallback
        console.warn(`Download link failed for track ${trackInfo.id}, falling back to streaming:`, 
          downloadError instanceof Error ? downloadError.message : String(downloadError))
      }
    }

    // Find the best quality transcoding
    const bestTranscoding = findBestTranscoding(trackInfo.media.transcodings)
    if (!bestTranscoding) {
      throw new InvalidTrackError(`No valid transcodings available for: ${url}`)
    }

    return await fromMediaObj(bestTranscoding, clientID, axiosInstance)
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    throw handleRequestError(error, `Failed to download track: ${url}`)
  }
}

/**
 * Finds the best quality transcoding from available options
 */
function findBestTranscoding(transcodings: readonly Transcoding[]): Transcoding | undefined {
  const validTranscodings = transcodings.filter(validateMedia)
  
  if (validTranscodings.length === 0) {
    return undefined
  }

  // Priority order: Progressive MP3 > Progressive AAC > HLS
  const priorities = [
    { protocol: STREAMING_PROTOCOLS.PROGRESSIVE, format: 'audio/mpeg' },
    { protocol: STREAMING_PROTOCOLS.PROGRESSIVE, format: 'audio/mp4' },
    { protocol: STREAMING_PROTOCOLS.PROGRESSIVE, format: 'audio/aac' },
    { protocol: STREAMING_PROTOCOLS.HLS, format: 'audio/mpeg' },
    { protocol: STREAMING_PROTOCOLS.HLS, format: 'audio/mp4' },
  ]

  for (const priority of priorities) {
    const matching = validTranscodings.find(t => 
      t.format.protocol === priority.protocol &&
      t.format.mime_type === priority.format
    )
    if (matching) {
      return matching
    }
  }

  // Fallback to first valid transcoding
  return validTranscodings[0]
}

export default download
