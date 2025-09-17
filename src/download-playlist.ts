import type { AxiosInstance } from 'axios'
import { download } from './download.js'
import { getSetInfo } from './info.js'
import { SoundCloudError } from './info.js'
import type m3u8stream from 'm3u8stream'

/**
 * Custom error for playlist operations
 */
export class PlaylistDownloadError extends SoundCloudError {
  constructor(
    message: string, 
    public readonly failedTracks?: readonly string[],
    public readonly totalTracks?: number
  ) {
    super(message, 'PLAYLIST_DOWNLOAD_ERROR')
    this.name = 'PlaylistDownloadError'
  }
}

/**
 * Result of downloading a single track
 */
interface TrackDownloadResult {
  readonly stream: NodeJS.ReadableStream | m3u8stream.Stream
  readonly title: string
  readonly permalink_url: string
  readonly index: number
}

/**
 * Result of downloading failed track
 */
interface FailedTrackDownload {
  readonly title: string
  readonly permalink_url: string
  readonly index: number
  readonly error: Error
}

/**
 * Complete playlist download result
 */
export interface PlaylistDownloadResult {
  readonly successful: readonly TrackDownloadResult[]
  readonly failed: readonly FailedTrackDownload[]
  readonly totalTracks: number
  readonly successCount: number
  readonly failureCount: number
}

/**
 * Downloads all tracks from a playlist/set with comprehensive error handling
 */
export async function downloadPlaylist(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance,
  options: {
    readonly concurrency?: number
    readonly continueOnError?: boolean
    readonly useDownloadLink?: boolean
  } = {}
): Promise<PlaylistDownloadResult> {
  const {
    concurrency = 3,
    continueOnError = true,
    useDownloadLink = true,
  } = options

  if (!url.trim()) {
    throw new SoundCloudError('Playlist URL cannot be empty')
  }

  if (concurrency < 1 || concurrency > 10) {
    throw new SoundCloudError('Concurrency must be between 1 and 10')
  }

  try {
    const playlistInfo = await getSetInfo(url, clientID, axiosInstance)
    
    if (!playlistInfo.tracks?.length) {
      throw new PlaylistDownloadError('Playlist contains no tracks', [], 0)
    }

    const tracks = playlistInfo.tracks.filter(track => 
      track.permalink_url && track.title && !track.title.includes('[Preview]')
    )

    if (tracks.length === 0) {
      throw new PlaylistDownloadError(
        'No downloadable tracks found in playlist',
        [],
        playlistInfo.tracks.length
      )
    }

    const results = await downloadTracksWithConcurrency(
      tracks,
      clientID,
      axiosInstance,
      concurrency,
      useDownloadLink,
      continueOnError
    )

    return {
      ...results,
      totalTracks: playlistInfo.tracks.length,
    }
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    throw new PlaylistDownloadError(
      `Failed to download playlist: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Downloads tracks with controlled concurrency
 */
async function downloadTracksWithConcurrency(
  tracks: readonly NonNullable<Parameters<typeof download>[0]>[],
  clientID: string,
  axiosInstance: AxiosInstance,
  concurrency: number,
  useDownloadLink: boolean,
  continueOnError: boolean
): Promise<Omit<PlaylistDownloadResult, 'totalTracks'>> {
  const successful: TrackDownloadResult[] = []
  const failed: FailedTrackDownload[] = []
  
  // Process tracks in batches with controlled concurrency
  for (let i = 0; i < tracks.length; i += concurrency) {
    const batch = tracks.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (track, batchIndex) => {
      const globalIndex = i + batchIndex
      
      try {
        const stream = await download(
          track.permalink_url!,
          clientID,
          axiosInstance,
          useDownloadLink
        )
        
        return {
          success: true as const,
          result: {
            stream,
            title: track.title!,
            permalink_url: track.permalink_url!,
            index: globalIndex,
          },
        }
      } catch (error) {
        const trackError = error instanceof Error ? error : new Error(String(error))
        
        return {
          success: false as const,
          result: {
            title: track.title || `Track ${globalIndex + 1}`,
            permalink_url: track.permalink_url || '',
            index: globalIndex,
            error: trackError,
          },
        }
      }
    })

    try {
      const batchResults = await Promise.all(batchPromises)
      
      for (const result of batchResults) {
        if (result.success) {
          successful.push(result.result)
        } else {
          failed.push(result.result)
          
          if (!continueOnError) {
            throw new PlaylistDownloadError(
              `Download failed for track "${result.result.title}": ${result.result.error.message}`,
              failed.map(f => f.title),
              tracks.length
            )
          }
        }
      }
    } catch (error) {
      if (!continueOnError) {
        throw error
      }
      
      // If continuing on error, individual track failures are already handled above
      console.error(`Batch processing error:`, error)
    }

    // Small delay between batches to be respectful to the API
    if (i + concurrency < tracks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return {
    successful,
    failed,
    successCount: successful.length,
    failureCount: failed.length,
  }
}

/**
 * @deprecated Use downloadPlaylist instead
 * Legacy function for backward compatibility
 */
export async function downloadPlaylistLegacy(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<readonly [readonly (NodeJS.ReadableStream | m3u8stream.Stream)[], readonly string[]]> {
  const result = await downloadPlaylist(url, clientID, axiosInstance, {
    continueOnError: false,
  })
  
  const streams = result.successful.map(track => track.stream)
  const titles = result.successful.map(track => track.title)
  
  return [streams, titles] as const
}

// Export the legacy function as default for backward compatibility
export default downloadPlaylistLegacy
