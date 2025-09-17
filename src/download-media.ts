/** @internal @packageDocumentation */
import m3u8stream from 'm3u8stream'
import STREAMING_PROTOCOLS from './protocols'
import { handleRequestErrs, appendURL } from './util'
import { Transcoding } from './info'
import { AxiosInstance } from 'axios'

const validatemedia = (media: Transcoding) => {
  if (!media || !media.url || !media.format) return false
  if (!media.format.protocol) return false
  // Sprawdź czy protocol jest obsługiwany
  if (!['hls', 'progressive'].includes(media.format.protocol)) return false
  return true
}

const fromMedia = async (media: Transcoding, clientID: string, axiosInstance: AxiosInstance): Promise<any | m3u8stream.Stream> => {
  if (!validatemedia(media)) throw new Error('Invalid media object provided')
  
  try {
    const link = appendURL(media.url, 'client_id', clientID)
    const res = await axiosInstance.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://soundcloud.com/'
      },
      withCredentials: true,
      timeout: 10000 // 10 sekund timeout
    })
    
    if (!res.data || !res.data.url) {
      throw new Error(`Invalid response from Soundcloud. No stream URL received: ${link}`)
    }

    // Sprawdź czy URL nie jest pusty lub invalid
    if (typeof res.data.url !== 'string' || res.data.url.length === 0) {
      throw new Error(`Invalid stream URL received: ${res.data.url}`)
    }

    if (media.format.protocol === STREAMING_PROTOCOLS.PROGRESSIVE) {
      const r = await axiosInstance.get(res.data.url, {
        withCredentials: true,
        responseType: 'stream',
        timeout: 15000, // 15 sekund timeout dla stream
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
          'Referer': 'https://soundcloud.com/'
        }
      })
      return r.data
    }
    
    // HLS stream z dodatkowymi opcjami
    return m3u8stream(res.data.url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
          'Referer': 'https://soundcloud.com/'
        }
      }
    })
  } catch (err: any) {
    // Lepsze informacje o błędach
    if (err.response?.status === 404) {
      throw new Error('Stream URL not found (404) - track may be unavailable or region restricted')
    }
    if (err.response?.status === 403) {
      throw new Error('Access forbidden (403) - track may be private or restricted')
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      throw new Error('Request timeout - SoundCloud servers may be slow or unavailable')
    }
    throw handleRequestErrs(err)
  }
}

export default fromMedia
