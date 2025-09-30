/** @internal @packageDocumentation */
import { URL } from 'url'
import { AxiosError, isAxiosError } from 'axios'

/* eslint-disable camelcase */
export interface PaginatedQuery<T> {
  collection: T[],
  total_results?: number, 
  next_href: string,
  query_urn: string
}

export const resolveURL = 'https://api-v2.soundcloud.com/resolve'

export const handleRequestErrs = (err: unknown): Error => {
  if (!isAxiosError(err)) {
    if (err instanceof Error) {
      return err;
    }
    return new Error('Unknown error occurred', { cause: err });
  }

  const axiosErr = err as AxiosError;
  
  if (!axiosErr.response) {
    const message = axiosErr.code === 'ECONNABORTED' 
      ? 'Request timeout. Please check your connection.'
      : axiosErr.code === 'ERR_NETWORK'
      ? 'Network error. Please check your internet connection.'
      : 'Request failed. Please try again.';
    return new Error(message, { cause: axiosErr });
  }

  const status = axiosErr.response.status;
  let descriptiveMessage = axiosErr.message;

  switch (status) {
    case 400:
      descriptiveMessage = 'Bad request. Please check the parameters.';
      break;
    case 401:
      descriptiveMessage = 'Authentication failed. Is your Client ID correct?';
      break;
    case 403:
      descriptiveMessage = 'Access forbidden. You may not have permission to access this resource.';
      break;
    case 404:
      descriptiveMessage = 'Resource not found. It may be private or the URL is incorrect.';
      break;
    case 429:
      descriptiveMessage = 'Rate limit exceeded. Please wait before making more requests.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      descriptiveMessage = 'SoundCloud server error. Please try again later.';
      break;
    default:
      descriptiveMessage = `Request failed with status ${status}: ${axiosErr.message}`;
  }

  return new Error(descriptiveMessage, { cause: axiosErr });
}

export const appendURL = (url: string, ...params: string[]): string => {
  try {
    const u = new URL(url);
    
    if (params.length % 2 !== 0) {
      throw new Error('Parameters must be provided in key-value pairs');
    }

    for (let idx = 0; idx < params.length; idx += 2) {
      const key = params[idx];
      const value = params[idx + 1];
      
      if (key && value !== undefined && value !== null) {
        u.searchParams.append(key, value);
      }
    }
    
    return u.href;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Invalid URL: ${url}`, { cause: err });
    }
    throw err;
  }
}

export const extractIDFromPersonalizedTrackURL = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')) return '';
  
  const split = url.split(':');
  if (split.length < 5) return '';
  
  return split[4] || '';
}

export const kindMismatchError = (expected: string, received: string): Error => 
  new Error(`Expected resource of kind: (${expected}), received: (${received})`);
