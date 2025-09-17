import { URL } from 'node:url'
import type { AxiosError } from 'axios'

export interface PaginatedQuery<T> {
  collection: T[]
  total_results?: number
  next_href: string
  query_urn: string
}

export const resolveURL = 'https://api-v2.soundcloud.com/resolve'

export const handleRequestErrs = (err: AxiosError) => {
  if (!err.response?.status) return err
  
  if (err.response.status === 401) {
    err.message += ', is your Client ID correct?'
  }
  if (err.response.status === 404) {
    err.message += ', could not find the song... it may be private - check the URL'
  }
  
  return err
}

export const appendURL = (url: string, ...params: string[]) => {
  const urlObj = new URL(url)
  for (let i = 0; i < params.length; i += 2) {
    if (params[i + 1] !== undefined) {
      urlObj.searchParams.append(params[i], params[i + 1])
    }
  }
  return urlObj.href
}

export const extractIDFromPersonalizedTrackURL = (url: string): string => {
  if (!url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')) return ''
  const parts = url.split(':')
  return parts.length >= 5 ? parts[4] : ''
}

export const kindMismatchError = (expected: string, received: string): Error =>
  new Error(`Expected resource of kind: (${expected}), received: (${received})`)
