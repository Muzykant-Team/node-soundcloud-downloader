import type { AxiosInstance } from 'axios'
import { download } from './download'
import { getSetInfo, type TrackInfo } from './info'

export const downloadPlaylist = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<[ReadableStream<any>[], string[]]> => {
  const info = await getSetInfo(url, clientID, axiosInstance)

  const trackNames: string[] = []
  const result = await Promise.all(info.tracks.map((track: TrackInfo) => {
    const p = download(track.permalink_url, clientID, axiosInstance)
    trackNames.push(track.title)
    return p
  }))

  return [result, trackNames]
}
