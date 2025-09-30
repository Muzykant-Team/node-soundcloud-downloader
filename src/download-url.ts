/** @internal @packageDocumentation */
import { AxiosInstance } from 'axios'
import m3u8stream from 'm3u8stream'
import { handleRequestErrs, appendURL } from './util'

// Konfigurowalny timeout z sensownym defaultem
const DEFAULT_API_TIMEOUT = 20000; // 20 sekund
const DEFAULT_STREAM_TIMEOUT = 30000; // 30 sekund
const MAX_RETRIES = 3;

const fromURL = async (
  url: string, 
  clientID: string, 
  axiosInstance: AxiosInstance,
  options?: {
    apiTimeout?: number;
    streamTimeout?: number;
  }
): Promise<any | m3u8stream.Stream> => {
  // Walidacja wejścia
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid URL parameter');
  }
  if (!clientID || typeof clientID !== 'string') {
    throw new Error('Invalid clientID parameter');
  }
  if (!axiosInstance) {
    throw new Error('Axios instance is required');
  }

  const apiTimeout = options?.apiTimeout || DEFAULT_API_TIMEOUT;
  const streamTimeout = options?.streamTimeout || DEFAULT_STREAM_TIMEOUT;

  try {
    const link = appendURL(url, 'client_id', clientID);
    
    const res = await axiosInstance.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      withCredentials: true,
      timeout: apiTimeout
    });

    // Walidacja odpowiedzi
    if (!res.data) {
      throw new Error('Empty response from SoundCloud API');
    }

    if (!res.data.url) {
      throw new Error(
        `Invalid response from SoundCloud. Missing 'url' field. Check if the URL is correct: ${link}`
      );
    }

    // Progressive download z retry logic
    if (url.includes('/progressive')) {
      let lastError: unknown;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const streamRes = await axiosInstance.get(res.data.url, {
            withCredentials: true,
            responseType: 'stream',
            timeout: streamTimeout
          });
          
          if (!streamRes.data) {
            throw new Error('Failed to retrieve audio stream');
          }
          
          return streamRes.data;
        } catch (streamErr) {
          lastError = streamErr;
          
          // Jeśli to nie ostatnia próba, czekaj przed ponowieniem
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => 
              setTimeout(resolve, 1000 * (attempt + 1))
            );
            continue;
          }
        }
      }

      throw new Error(
        `Failed to download progressive stream after ${MAX_RETRIES} attempts`, 
        { cause: lastError }
      );
    }

    // HLS stream z retry logic
    try {
      return m3u8stream(res.data.url, {
        requestOptions: {
          maxRetries: MAX_RETRIES,
          maxReconnects: MAX_RETRIES
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
