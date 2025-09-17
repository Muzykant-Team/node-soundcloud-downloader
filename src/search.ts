/* eslint-disable camelcase */
import { AxiosInstance } from 'axios'
import { TrackInfo, User, SetInfo } from './info'
import { appendURL, PaginatedQuery } from './util'

const baseURL = 'https://api-v2.soundcloud.com/search'

export interface RelatedResponse<T> extends PaginatedQuery<T> {
  variant: string
}

export interface SearchOptions {
  limit?: number,
  offset?: number,
  resourceType?: SoundcloudResource | 'all',
  query?: string,
  nextHref?: string
}

export type SearchResponseAll = PaginatedQuery<User | SetInfo | TrackInfo>
export type SoundcloudResource = 'tracks' | 'users' | 'albums' | 'playlists'

const validResourceTypes = ['tracks', 'users', 'albums', 'playlists', 'all']

/** @internal */
export const search = async (
  options: SearchOptions,
  axiosInstance: AxiosInstance,
  clientID: string
): Promise<SearchResponseAll> => {
  let url = ''
  if (!options.limit) options.limit = 10
  if (!options.offset) options.offset = 0
  if (!options.resourceType) options.resourceType = 'tracks'
  
  if (options.nextHref) {
    url = appendURL(options.nextHref, 'client_id', clientID)
  } else if (options.query) {
    if (!validResourceTypes.includes(options.resourceType)) {
      throw new Error(
        `${options.resourceType} is not one of ${validResourceTypes
          .map(str => `'${str}'`)
          .join(', ')}`
      )
    }
    url = appendURL(
      `${baseURL}${options.resourceType === 'all' ? '' : `/${options.resourceType}`}`,
      'client_id',
      clientID,
      'q',
      options.query,
      'limit',
      '' + options.limit,
      'offset',
      '' + options.offset
    )
  } else {
    throw new Error('One of options.query or options.nextHref is required')
  }

  const { data } = await axiosInstance.get(url)
  
  // Ulepszone filtrowanie dla tracks
  if (options.resourceType === 'tracks' && Array.isArray(data.collection)) {
    data.collection = data.collection.filter((track: any) => {
      // Podstawowe sprawdzenia
      if (!track || typeof track !== 'object') return false
      
      // Sprawdź czy ma wymagane pola
      if (!track.permalink_url || !track.title) return false
      
      // Odrzucaj sample o długości w pobliżu 30s (29.5–30.5 sekundy)
      if (
        typeof track.duration === 'number' &&
        track.duration >= 29500 &&
        track.duration <= 30500
      ) return false
      
      // Sprawdź dostępność regionalną
      if ('region_restricted' in track && track.region_restricted === true) return false
      
      // Sprawdź czy można streamować
      if (track.streamable !== true) return false
      
      // Sprawdź stan utworu
      if (track.state && track.state !== 'finished') return false
      
      // Sprawdź policy (blokady)
      if (track.policy === 'BLOCK' || track.policy === 'SNIP') return false
      
      // Sprawdź czy ma media/transcodings
      if (!track.media || !track.media.transcodings || track.media.transcodings.length === 0) return false
      
      // Sprawdź czy ma dostępne formaty streamowania
      const hasValidFormat = track.media.transcodings.some((transcoding: any) => 
        transcoding && 
        transcoding.url && 
        (transcoding.format?.protocol === 'hls' || transcoding.format?.protocol === 'progressive')
      )
      
      if (!hasValidFormat) return false
      
      // Odrzucaj deleted/private tracks
      if (track.sharing === 'private' && !track.streamable) return false
      
      return true
    })
    
    // Sortuj wyniki - preferuj pełne utwory (dłuższe) i popularne
    data.collection.sort((a: any, b: any) => {
      // Preferuj dłuższe utwory (prawdopodobnie pełne wersje)
      const durationScore = (b.duration || 0) - (a.duration || 0)
      // Preferuj popularne (więcej polubień)
      const likesScore = (b.likes_count || 0) - (a.likes_count || 0)
      // Kombinuj oba czynniki
      return (durationScore * 0.3) + (likesScore * 0.7)
    })
  }
  
  return data as SearchResponseAll
}

/** @internal */
export const related = async <T extends TrackInfo>(
  id: number,
  limit = 10,
  offset = 0,
  axiosInstance: AxiosInstance,
  clientID: string
): Promise<RelatedResponse<T>> => {
  const { data } = await axiosInstance.get(
    appendURL(
      `https://api-v2.soundcloud.com/tracks/${id}/related`,
      'client_id',
      clientID,
      'offset',
      '' + offset,
      'limit',
      '' + limit
    )
  )
  
  // Zastosuj podobne filtrowanie dla related tracks
  if (Array.isArray(data.collection)) {
    data.collection = data.collection.filter((track: any) => {
      if (!track || typeof track !== 'object') return false
      if (!track.permalink_url || !track.title) return false
      
      if (
        typeof track.duration === 'number' &&
        track.duration >= 29500 &&
        track.duration <= 30500
      ) return false
      
      if (track.streamable !== true) return false
      if (track.state && track.state !== 'finished') return false
      if (track.policy === 'BLOCK' || track.policy === 'SNIP') return false
      
      return true
    })
  }
  
  return data as RelatedResponse<T>
}
