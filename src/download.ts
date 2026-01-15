/** @internal @packageDocumentation */

import type { AxiosInstance } from 'axios'
import m3u8stream from 'm3u8stream'
import { handleRequestErrs, appendURL } from './util'
import getInfo, { type Transcoding } from './info'

export const getMediaURL = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<string> => {
  const res = await axiosInstance.get(appendURL(url, 'client_id', clientID), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    withCredentials: true
  })
  if (!res.data.url) throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${url}`)
  return res.data.url
}

export const getProgressiveStream = async (mediaUrl: string, axiosInstance: AxiosInstance) => {
  const r = await axiosInstance.get(mediaUrl, {
    withCredentials: true,
    responseType: 'stream'
  })

  return r.data
}

export const getHLSStream = (mediaUrl: string) => m3u8stream(mediaUrl)

/** @internal */
type fromURLFunctionBase = (url: string, clientID: string,
  getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>,
  getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>,
  getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream,
  axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>

export const fromURLBase: fromURLFunctionBase = async (url: string, clientID: string,
  getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>,
  getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>,
  getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream,
  axiosInstance: AxiosInstance): Promise<any | m3u8stream.Stream> => {
  try {
    const mediaUrl = await getMediaURLFunction(url, clientID, axiosInstance)

    if (url.includes('/progressive')) {
      return await getProgressiveStreamFunction(mediaUrl, axiosInstance)
    }

    return getHLSStreamFunction(mediaUrl)
  } catch (err) {
    throw handleRequestErrs(err)
  }
}

export const fromURL = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<any | m3u8stream.Stream> => await fromURLBase(url, clientID, getMediaURL, getProgressiveStream, getHLSStream, axiosInstance)

export const fromMediaObjBase = async (media: Transcoding, clientID: string,
  getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>,
  getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>,
  getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream,
  fromURLFunction: typeof fromURL,
  axiosInstance: AxiosInstance): Promise<any | m3u8stream.Stream> => {
  if (!validateMedia(media)) throw new Error('Invalid media object provided')
  return await fromURLFunction(media.url, clientID, axiosInstance)
}

export const fromMediaObj = async (media: Transcoding, clientID: string, axiosInstance: AxiosInstance) => await fromMediaObjBase(media, clientID, getMediaURL, getProgressiveStream, getHLSStream, fromURL, axiosInstance)

export const fromDownloadLink = async (id: number, clientID: string, axiosInstance: AxiosInstance) => {
  const { data: { redirectUri } } = await axiosInstance.get(appendURL(`https://api-v2.soundcloud.com/tracks/${id}/download`, 'client_id', clientID))
  const { data } = await axiosInstance.get(redirectUri, {
    responseType: 'stream'
  })

  return data
}

/**
 * Waliduje czy media transcoding jest prawidłowy
 * @internal
 */
const validateMedia = (media: Transcoding): boolean => {
  if (!media || !media.url || !media.format) return false
  if (!media.format.protocol) return false
  // Sprawdź czy protocol jest obsługiwany
  if (!['hls', 'progressive'].includes(media.format.protocol)) return false
  return true
}

/** @internal */
export const download = async (url: string, clientID: string, axiosInstance: AxiosInstance, useDownloadLink = true) => {
  const info = await getInfo(url, clientID, axiosInstance)

  if (info.downloadable && useDownloadLink) {
    try {
      return await fromDownloadLink(info.id, clientID, axiosInstance)
    } catch (err) {
      console.log('Download link failed, trying transcoding...')
    }
  }

  // Ulepszone wybieranie najlepszego transcoding
  const availableTranscodings = info.media.transcodings.filter(t =>
    validateMedia(t) &&
    t.url &&
    t.format &&
    (t.format.protocol === 'hls' || t.format.protocol === 'progressive')
  )

  if (availableTranscodings.length === 0) {
    throw new Error('No valid transcoding available for this track')
  }

  // Preferuj progressive nad HLS (lepiej działa z Discord)
  const preferredTranscoding = availableTranscodings.find(t =>
    t.format.protocol === 'progressive'
  ) || availableTranscodings[0]

  // Spróbuj wszystkich dostępnych transcodings jeśli pierwszy nie działa
  for (let i = 0; i < availableTranscodings.length; i++) {
    const transcoding = availableTranscodings[i]
    try {
      return await fromMediaObj(transcoding, clientID, axiosInstance)
    } catch (err) {
      console.log(`Transcoding failed: ${transcoding.format.protocol}, trying next...`)
      if (i === availableTranscodings.length - 1) {
        throw err // Ostatni transcoding - rzuć błąd
      }
    }
  }
}
