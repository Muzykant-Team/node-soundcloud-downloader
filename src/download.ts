import type { AxiosInstance } from 'axios'
import m3u8stream from 'm3u8stream'
import { handleRequestErrs, appendURL } from './util.js'
import getInfo, { type Transcoding } from './info.js'

export const getMediaURL = async (url: string, clientID: string, axiosInstance: AxiosInstance): Promise<string> => {
  const res = await axiosInstance.get(appendURL(url, 'client_id', clientID), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    withCredentials: true
  })
  
  if (!res.data.url) {
    throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${url}`)
  }
  
  return res.data.url
}

export const getProgressiveStream = async (mediaUrl: string, axiosInstance: AxiosInstance) => {
  const response = await axiosInstance.get(mediaUrl, {
    withCredentials: true,
    responseType: 'stream'
  })
  return response.data
}

export const getHLSStream = (mediaUrl: string) => m3u8stream(mediaUrl)

type FromURLFunctionBase = (
  url: string,
  clientID: string,
  getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>,
  getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>,
  getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream,
  axiosInstance: AxiosInstance
) => Promise<any | m3u8stream.Stream>

export const fromURLBase: FromURLFunctionBase = async (
  url,
  clientID,
  getMediaURLFunction,
  getProgressiveStreamFunction,
  getHLSStreamFunction,
  axiosInstance
) => {
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

export const fromURL = async (url: string, clientID: string, axiosInstance: AxiosInstance) =>
  await fromURLBase(url, clientID, getMediaURL, getProgressiveStream, getHLSStream, axiosInstance)

const validateMedia = (media: Transcoding) => {
  return !!(media.url && media.format)
}

export const fromMediaObjBase = async (
  media: Transcoding,
  clientID: string,
  getMediaURLFunction: typeof getMediaURL,
  getProgressiveStreamFunction: typeof getProgressiveStream,
  getHLSStreamFunction: typeof getHLSStream,
  fromURLFunction: typeof fromURL,
  axiosInstance: AxiosInstance
) => {
  if (!validateMedia(media)) throw new Error('Invalid media object provided')
  return await fromURLFunction(media.url, clientID, axiosInstance)
}

export const fromMediaObj = async (media: Transcoding, clientID: string, axiosInstance: AxiosInstance) =>
  await fromMediaObjBase(media, clientID, getMediaURL, getProgressiveStream, getHLSStream, fromURL, axiosInstance)

export const fromDownloadLink = async (id: number, clientID: string, axiosInstance: AxiosInstance) => {
  const { data: { redirectUri } } = await axiosInstance.get(
    appendURL(`https://api-v2.soundcloud.com/tracks/${id}/download`, 'client_id', clientID)
  )
  
  const { data } = await axiosInstance.get(redirectUri, {
    responseType: 'stream'
  })

  return data
}

export const download = async (url: string, clientID: string, axiosInstance: AxiosInstance, useDownloadLink = true) => {
  const info = await getInfo(url, clientID, axiosInstance)
  
  if (info.downloadable && useDownloadLink) {
    try {
      return await fromDownloadLink(info.id, clientID, axiosInstance)
    } catch (err) {
      // Fall through to transcoding download
    }
  }

  return await fromMediaObj(info.media.transcodings[0], clientID, axiosInstance)
}
