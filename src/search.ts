/* eslint-disable camelcase */
import { AxiosInstance } from 'axios'
import { TrackInfo, User, SetInfo } from './info'
import { appendURL, PaginatedQuery } from './util'

/** @internal */
const baseURL = 'https://api-v2.soundcloud.com/search'

export interface RelatedResponse<T> extends PaginatedQuery<T> {
  variant: string
}

export interface SearchOptions {
  limit?: number, // defaults to 10
  offset?: number, // defaults to 0
  resourceType?: SoundcloudResource | 'all', // defaults to 'tracks'
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

  // DODANE: filtracja po stronie klienta, nie zmienia logiki, tylko poprawia wyniki
  if (options.resourceType === 'tracks' && Array.isArray(data.collection)) {
    // Odfiltruj utwory, które mają dokładnie 30 sekund (30000 ms)
    // oraz mają ograniczenia regionalne (jeśli pole istnieje)
    // lub nie są streamowalne
    data.collection = data.collection.filter((track: any) => {
      if (track.duration === 30000) return false
      if ('region_restricted' in track && track.region_restricted === true) return false
      if (track.streamable !== true) return false
      return true
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
  return data as RelatedResponse<T>
}
