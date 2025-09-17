import type { AxiosInstance } from 'axios'
import { handleRequestErrs, appendURL, extractIDFromPersonalizedTrackURL } from './util.js'
import type STREAMING_PROTOCOLS from './protocols.js'
import type FORMATS from './formats.js'

export interface User {
  kind: string
  avatar_url: string
  city: string
  comments_count: number
  country_code: string
  created_at: string
  description: string
  followers_count: number
  followings_count: number
  first_name: string
  full_name: string
  groups_count: number
  id: number
  last_name: string
  permalink_url: string
  uri: string
  username: string
}

export interface TrackInfo {
  kind: string
  monetization_model: string
  id: number
  policy: string
  comment_count?: number
  full_duration?: number
  downloadable?: boolean
  created_at?: string
  description?: string
  media?: { transcodings: Transcoding[] }
  title?: string
  publisher_metadata?: any
  duration?: number
  has_downloads_left?: boolean
  artwork_url?: string
  public?: boolean
  streamable?: boolean
  tag_list?: string
  genre?: string
  reposts_count?: number
  label_name?: string
  state?: string
  last_modified?: string
  commentable?: boolean
  uri?: string
  download_count?: number
  likes_count?: number
  display_date?: string
  user_id?: number
  waveform_url?: string
  permalink?: string
  permalink_url?: string
  user?: User
  playback_count?: number
  region_restricted?: boolean
}

export interface SetInfo {
  duration: number
  permalink_url: string
  reposts_count: number
  genre: string
  permalink: string
  purchase_url?: string
  description?: string
  uri: string
  label_name?: string
  tag_list: string
  set_type: string
  public: boolean
  track_count: number
  user_id: number
  last_modified: string
  license: string
  tracks: TrackInfo[]
  id: number
  release_date?: string
  display_date: string
  sharing: string
  secret_token?: string
  created_at: string
  likes_count: number
  kind: string
  purchase_title?: string
  managed_by_feeds: boolean
  artwork_url?: string
  is_album: boolean
  user: User
  published_at: string
  embeddable_by: string
}

export interface Transcoding {
  url: string
  preset: string
  snipped: boolean
  format: { protocol: STREAMING_PROTOCOLS, mime_type: FORMATS }
}

const getTrackInfoBase = async (
  clientID: string,
  axiosRef: AxiosInstance,
  ids: number[],
  playlistID?: number,
  playlistSecretToken?: string
): Promise<TrackInfo[]> => {
  let url = appendURL(
    'https://api-v2.soundcloud.com/tracks',
    'ids', ids.join(','),
    'client_id', clientID
  )
  
  if (playlistID && playlistSecretToken) {
    url = appendURL(url, 'playlistId', String(playlistID), 'playlistSecretToken', playlistSecretToken)
  }
  
  try {
    const { data } = await axiosRef.get(url)
    return data as TrackInfo[]
  } catch (err) {
    throw handleRequestErrs(err)
  }
}

export const getInfoBase = async <T extends TrackInfo | SetInfo>(
  url: string,
  clientID: string,
  axiosRef: AxiosInstance
): Promise<T> => {
  try {
    const res = await axiosRef.get(
      appendURL('https://api-v2.soundcloud.com/resolve', 'url', url, 'client_id', clientID),
      { withCredentials: true }
    )
    return res.data as T
  } catch (err) {
    throw handleRequestErrs(err)
  }
}

const getSetInfoBase = async (url: string, clientID: string, axiosRef: AxiosInstance): Promise<SetInfo> => {
  const setInfo = await getInfoBase<SetInfo>(url, clientID, axiosRef)
  const originalOrder = setInfo.tracks.map(track => track.id)
  const incompleteTracks = setInfo.tracks.filter(track => !track.title)
  
  if (incompleteTracks.length === 0) {
    return setInfo
  }
  
  const completeTracks = setInfo.tracks.filter(track => track.title)
  const ids = incompleteTracks.map(t => t.id)
  
  if (ids.length > 50) {
    const chunks = []
    for (let i = 0; i < ids.length; i += 50) {
      chunks.push(ids.slice(i, i + 50))
    }
    
    const promises = chunks.map(async chunkIds => 
      await getTrackInfoByID(clientID, axiosRef, chunkIds, setInfo.id, setInfo.secret_token)
    )
    const results = await Promise.all(promises)
    const allTracks = completeTracks.concat(...results)
    setInfo.tracks = sortTracks(allTracks, originalOrder)
  } else {
    const info = await getTrackInfoByID(clientID, axiosRef, ids, setInfo.id, setInfo.secret_token)
    setInfo.tracks = completeTracks.concat(info)
    setInfo.tracks = sortTracks(setInfo.tracks, originalOrder)
  }
  
  return setInfo
}

const sortTracks = (tracks: TrackInfo[], ids: number[]): TrackInfo[] => {
  const trackMap = new Map(tracks.map(track => [track.id, track]))
  return ids.map(id => trackMap.get(id)).filter(Boolean) as TrackInfo[]
}

const getInfo = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<TrackInfo> => {
  let data: TrackInfo
  
  if (url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')) {
    const idString = extractIDFromPersonalizedTrackURL(url)
    if (!idString) throw new Error('Could not parse track ID from given URL: ' + url)
    
    const id = parseInt(idString, 10)
    if (Number.isNaN(id)) throw new Error('Could not parse track ID from given URL: ' + url)
    
    const tracks = await getTrackInfoByID(clientID, axiosInstance, [id])
    data = tracks[0]
    if (!data) throw new Error('Could not find track with ID: ' + id)
  } else {
    data = await getInfoBase<TrackInfo>(url, clientID, axiosInstance)
  }
  
  if (!data.media) throw new Error('The given URL does not link to a Soundcloud track')
  return data
}

export const getSetInfo = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<SetInfo> => {
  const data = await getSetInfoBase(url, clientID, axiosInstance)
  if (!data.tracks) throw new Error('The given URL does not link to a Soundcloud set')
  return data
}

export const getTrackInfoByID = async (
  clientID: string,
  axiosInstance: AxiosInstance,
  ids: number[],
  playlistID?: number,
  playlistSecretToken?: string
) => {
  return await getTrackInfoBase(clientID, axiosInstance, ids, playlistID, playlistSecretToken)
}

export default getInfo
