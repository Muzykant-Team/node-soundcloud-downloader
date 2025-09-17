import m3u8stream from 'm3u8stream'
import type { AxiosInstance } from 'axios'
import { STREAMING_PROTOCOLS } from './protocols.js'
import { handleRequestError, appendURL } from './util.js'
import type { Transcoding } from './info.js'
import { SoundCloudError } from './info.js'

/**
 * Custom error for media streaming issues
 */
export class MediaStreamError extends SoundCloudError {
  constructor(message: string, public readonly mediaUrl?: string) {
    super(message, 'MEDIA_STREAM_ERROR')
    this.name = 'MediaStreamError'
  }
}

/**
 * Custom error for invalid media objects
 */
export class InvalidMediaError extends SoundCloudError {
  constructor(message: string = 'Invalid media object provided') {
    super(message, 'INVALID_MEDIA')
    this.name = 'InvalidMediaError'
  }
}

/**
 * Default headers for SoundCloud requests
 */
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
} as const

/**
 * Request timeout in milliseconds
 */
const REQUEST_TIMEOUT = 30000 as const

/**
 * Validates media transcoding object
 */
function validateMedia(media: Transcoding): boolean {
  return Boolean(
    media?.url &&
    media?.format?.protocol &&
    media?.format?.mime_type
  )
}

/**
 * Creates a stream from media transcoding with enhanced error handling
 */
async function createStreamFromMedia(
  media: Transcoding,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<NodeJS.ReadableStream | m3u8stream.Stream> {
  if (!validateMedia(media)) {
    throw new InvalidMediaError('Media object must have url, format.protocol, and format.mime_type')
  }

  try {
    // Get the actual streaming URL
    const mediaURL = appendURL(media.url, 'client_id', clientID)
    
    const response = await axiosInstance.get<{ url: string }>(mediaURL, {
      headers: DEFAULT_HEADERS,
      withCredentials: true,
      timeout: REQUEST_TIMEOUT,
    })

    if (!response.data?.url) {
      throw new MediaStreamError(
        'Invalid response from SoundCloud API - missing stream URL',
        mediaURL
      )
    }

    const streamURL = response.data.url

    // Handle different streaming protocols
    switch (media.format.protocol) {
      case STREAMING_PROTOCOLS.PROGRESSIVE: {
        const streamResponse = await axiosInstance.get(streamURL, {
          withCredentials: true,
          responseType: 'stream',
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Range': 'bytes=0-',
          },
        })
        
        return streamResponse.data as NodeJS.ReadableStream
      }
      
      case STREAMING_PROTOCOLS.HLS: {
        return m3u8stream(streamURL, {
          requestOptions: {
            headers: DEFAULT_HEADERS,
            timeout: REQUEST_TIMEOUT,
          },
        })
      }
      
      default: {
        throw new MediaStreamError(
          `Unsupported streaming protocol: ${media.format.protocol}`,
          streamURL
        )
      }
    }
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    
    throw handleRequestError(
      error,
      `Failed to create stream from media: ${media.url}`
    )
  }
}

export default createStreamFromMedia
