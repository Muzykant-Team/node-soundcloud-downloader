/** @internal @packageDocumentation */
import { AxiosInstance, AxiosError } from 'axios'
import m3u8stream from 'm3u8stream'
import { handleRequestErrs, appendURL } from './util'

const fromURL = async (
  url: string, 
  clientID: string, 
  axiosInstance: AxiosInstance
): Promise<any | m3u8stream.Stream> => {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL parameter');
  }
  if (!clientID || typeof clientID !== 'string') {
    throw new Error('Invalid clientID parameter');
  }
  if (!axiosInstance) {
    throw new Error('Axios instance is required');
  }

  try {
    const link = appendURL(url, 'client_id', clientID);
    
    const res = await axiosInstance.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      withCredentials: true,
      timeout: 10000 
    });

    if (!res.data) {
      throw new Error('Empty response from SoundCloud API');
    }

    if (!res.data.url) {
      throw new Error(
        `Invalid response from SoundCloud. Missing 'url' field. Check if the URL is correct: ${link}`
      );
    }

    if (url.includes('/progressive')) {
      try {
        const streamRes = await axiosInstance.get(res.data.url, {
          withCredentials: true,
          responseType: 'stream',
          timeout: 30000 
        });
        
        if (!streamRes.data) {
          throw new Error('Failed to retrieve audio stream');
        }
        
        return streamRes.data;
      } catch (streamErr) {
        throw new Error('Failed to download progressive stream', { cause: streamErr });
      }
    }

    try {
      return m3u8stream(res.data.url, {
        requestOptions: {
          maxRetries: 3,
          maxReconnects: 3
        }
      });
    } catch (m3u8Err) {
      throw new Error('Failed to create HLS stream', { cause: m3u8Err });
    }

  } catch (err) {
    throw handleRequestErrs(err);
  }
}

export default fromURL;
