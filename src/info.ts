import type { AxiosInstance } from 'axios'
import { handleRequestError, appendURL, extractIDFromPersonalizedTrackURL } from './util.js'
import type { STREAMING_PROTOCOLS } from './protocols.js'
import type { FORMATS } from './formats.js'

/**
 * A SoundCloud user
 */
export interface User {
  readonly kind: string
  readonly avatar_url: string
  readonly city: string
  readonly comments_count: number
  readonly country_code: string
  readonly created_at: string
  readonly description: string
  readonly followers_count: number
  readonly followings_count: number
  readonly first_name: string
  readonly full_name: string
  readonly groups_count: number
  readonly id: number
  readonly last_name: string
  readonly permalink_url: string
  readonly uri: string
  readonly username: string
}

/**
 * Details about the track
 */
export interface TrackInfo {
  readonly kind: string
  readonly monetization_model: string
  readonly id: number
  readonly policy: string
  readonly comment_count?: number
  readonly full_duration?: number
  readonly downloadable?: boolean
  readonly created_at?: string
  readonly description?: string
  readonly media?: { transcodings: readonly Transcoding[] }
  readonly title?: string
  readonly publisher_metadata?: unknown
  readonly duration?: number
  readonly has_downloads_left?: boolean
  readonly artwork_url?: string
  readonly public?: boolean
  readonly streamable?: boolean
  readonly tag_list?: string
  readonly genre?: string
  readonly reposts_count?: number
  readonly label_name?: string
  readonly state?: string
  readonly last_modified?: string
  readonly commentable?: boolean
  readonly uri?: string
  readonly download_count?: number
  readonly likes_count?: number
  readonly display_date?: string
  readonly user_id?: number
  readonly waveform_url?: string
  readonly permalink?: string
  readonly permalink_url?: string
  readonly user?: User
  readonly playback_count?: number
}

/**
 * Details about a Set
 */
export interface SetInfo {
  readonly duration: number
  readonly permalink_url: string
  readonly reposts_count: number
  readonly genre: string
  readonly permalink: string
  readonly purchase_url?: string
  readonly description?: string
  readonly uri: string
  readonly label_name?: string
  readonly tag_list: string
  readonly set_type: string
  readonly public: boolean
  readonly track_count: number
  readonly user_id: number
  readonly last_modified: string
  readonly license: string
  readonly tracks: readonly TrackInfo[]
  readonly id: number
  readonly release_date?: string
  readonly display_date: string
  readonly sharing: string
  readonly secret_token?: string
  readonly created_at: string
  readonly likes_count: number
  readonly kind: string
  readonly purchase_title?: string
  readonly managed_by_feeds: boolean
  readonly artwork_url?: string
  readonly is_album: boolean
  readonly user: User
  readonly published_at: string
  readonly embeddable_by: string
}

/**
 * Represents an audio link to a SoundCloud Track
 */
export interface Transcoding {
  readonly url: string
  readonly preset: string
  readonly snipped: boolean
  readonly format: { 
    readonly protocol: STREAMING_PROTOCOLS
    readonly mime_type: FORMATS 
  }
}

/**
 * Custom error classes for better error handling
 */
export class SoundCloudError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'SoundCloudError'
  }
}

export class TrackNotFoundError extends SoundCloudError {
  constructor(url: string) {
    super(`Track not found: ${url}`, 'TRACK_NOT_FOUND', 404)
    this.name = 'TrackNotFoundError'
  }
}

export class InvalidTrackError extends SoundCloudError {
  constructor(url: string) {
    super(`Invalid track URL or missing media: ${url}`, 'INVALID_TRACK')
    this.name = 'InvalidTrackError'
  }
}

export class SetNotFoundError extends SoundCloudError {
  constructor(url: string) {
    super(`Set not found: ${url}`, 'SET_NOT_FOUND', 404)
    this.name = 'SetNotFoundError'
  }
}

const API_BASE_URL = 'https://api-v2.soundcloud.com' as const
const MAX_BATCH_SIZE = 50 as const

/**
 * Retrieves track information by IDs with improved error handling
 */
async function getTrackInfoBase(
  clientID: string,
  axiosRef: AxiosInstance,
  ids: readonly number[],
  playlistID?: number,
  playlistSecretToken?: string
): Promise<readonly TrackInfo[]> {
  if (ids.length === 0) {
    return []
  }

  let url = appendURL(`${API_BASE_URL}/tracks`, 'ids', ids.join(','), 'client_id', clientID)
  
  if (playlistID !== undefined && playlistSecretToken) {
    url = appendURL(url, 'playlistId', String(playlistID), 'playlistSecretToken', playlistSecretToken)
  }

  try {
    const { data } = await axiosRef.get<readonly TrackInfo[]>(url)
    return data
  } catch (error) {
    throw handleRequestError(error, `Failed to fetch track info for IDs: ${ids.join(', ')}`)
  }
}

/**
 * Generic function to resolve SoundCloud URLs
 */
export async function getInfoBase<T extends TrackInfo | SetInfo>(
  url: string,
  clientID: string,
  axiosRef: AxiosInstance
): Promise<T> {
  if (!url.trim()) {
    throw new SoundCloudError('URL cannot be empty')
  }

  try {
    const resolveURL = appendURL(`${API_BASE_URL}/resolve`, 'url', url, 'client_id', clientID)
    const response = await axiosRef.get<T>(resolveURL, {
      withCredentials: true,
      timeout: 10000,
    })

    return response.data
  } catch (error) {
    throw handleRequestError(error, `Failed to resolve URL: ${url}`)
  }
}

/**
 * Retrieves complete set information with all track details
 */
async function getSetInfoBase(
  url: string,
  clientID: string,
  axiosRef: AxiosInstance
): Promise<SetInfo> {
  const setInfo = await getInfoBase<SetInfo>(url, clientID, axiosRef)
  
  if (!setInfo.tracks) {
    throw new SetNotFoundError(url)
  }

  const originalTrackOrder = setInfo.tracks.map(track => track.id)
  const incompleteTracks = setInfo.tracks.filter(track => !track.title)
  
  if (incompleteTracks.length === 0) {
    return setInfo
  }

  const completeTracks = setInfo.tracks.filter(track => Boolean(track.title))
  const incompleteTrackIds = incompleteTracks.map(track => track.id)

  // Process tracks in batches to handle large playlists
  const trackBatches = []
  for (let i = 0; i < incompleteTrackIds.length; i += MAX_BATCH_SIZE) {
    trackBatches.push(incompleteTrackIds.slice(i, i + MAX_BATCH_SIZE))
  }

  const batchPromises = trackBatches.map(batch => 
    getTrackInfoByID(clientID, axiosRef, batch, setInfo.id, setInfo.secret_token)
  )

  try {
    const batchResults = await Promise.all(batchPromises)
    const allFetchedTracks = batchResults.flat()
    
    const allTracks = [...completeTracks, ...allFetchedTracks]
    const sortedTracks = sortTracks(allTracks, originalTrackOrder)
    
    return {
      ...setInfo,
      tracks: sortedTracks,
    }
  } catch (error) {
    throw new SoundCloudError(
      `Failed to fetch complete track information for set: ${url}`,
      'SET_TRACKS_FETCH_ERROR'
    )
  }
}

/**
 * Sorts tracks according to original playlist order
 */
function sortTracks(tracks: readonly TrackInfo[], originalOrder: readonly number[]): readonly TrackInfo[] {
  const trackMap = new Map(tracks.map(track => [track.id, track]))
  
  return originalOrder
    .map(id => trackMap.get(id))
    .filter((track): track is TrackInfo => track !== undefined)
}

/**
 * Main function to get track information with enhanced error handling
 */
async function getTrackInfo(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<TrackInfo> {
  if (!url.trim()) {
    throw new SoundCloudError('URL cannot be empty')
  }

  let trackData: TrackInfo

  try {
    if (url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')) {
      const idString = extractIDFromPersonalizedTrackURL(url)
      if (!idString) {
        throw new InvalidTrackError(url)
      }

      const id = Number.parseInt(idString, 10)
      if (Number.isNaN(id)) {
        throw new InvalidTrackError(url)
      }

      const tracks = await getTrackInfoByID(clientID, axiosInstance, [id])
      const track = tracks[0]
      
      if (!track) {
        throw new TrackNotFoundError(url)
      }
      
      trackData = track
    } else {
      trackData = await getInfoBase<TrackInfo>(url, clientID, axiosInstance)
    }

    if (!trackData.media?.transcodings?.length) {
      throw new InvalidTrackError(url)
    }

    return trackData
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    throw handleRequestError(error, `Failed to get track info for: ${url}`)
  }
}

/**
 * Get set information with enhanced error handling
 */
export async function getSetInfo(
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<SetInfo> {
  if (!url.trim()) {
    throw new SoundCloudError('URL cannot be empty')
  }

  try {
    const setData = await getSetInfoBase(url, clientID, axiosInstance)
    
    if (!setData.tracks?.length) {
      throw new SetNotFoundError(url)
    }
    
    return setData
  } catch (error) {
    if (error instanceof SoundCloudError) {
      throw error
    }
    throw handleRequestError(error, `Failed to get set info for: ${url}`)
  }
}

/**
 * Get track information by IDs
 */
export async function getTrackInfoByID(
  clientID: string,
  axiosInstance: AxiosInstance,
  ids: readonly number[],
  playlistID?: number,
  playlistSecretToken?: string
): Promise<readonly TrackInfo[]> {
  if (ids.length === 0) {
    return []
  }

  return getTrackInfoBase(clientID, axiosInstance, ids, playlistID, playlistSecretToken)
}

export default getTrackInfo
