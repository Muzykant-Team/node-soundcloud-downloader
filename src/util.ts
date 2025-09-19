/** @internal @packageDocumentation */
import { URL } from 'url'
import axios, { AxiosError, isAxiosError } from 'axios'

/* eslint-disable camelcase */

/**
 * Generic shape for paginated responses from SoundCloud API v2.
 */
export interface PaginatedQuery<T> {
  collection: T[]
  /** total_results is omitted by the API when `limit` param is supplied */
  total_results?: number
  next_href?: string | null
  query_urn?: string
}

export const resolveURL = 'https://api-v2.soundcloud.com/resolve'

/**
 * Custom error class for more informative error propagation.
 * Keeps original error for debugging and optionally exposes HTTP status.
 */
export class SoundCloudError extends Error {
  public status?: number
  public original?: unknown
  public code?: string

  constructor(message: string, opts?: { status?: number; original?: unknown; code?: string }) {
    super(message)
    this.name = 'SoundCloudError'
    if (opts?.status) this.status = opts.status
    if (opts?.original) this.original = opts.original
    if (opts?.code) this.code = opts.code
    // maintain proper prototype chain (important when targeting older runtimes)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Normalize and enrich errors coming from axios / network or unexpected sources.
 * - Accepts `unknown` so callers can pass any thrown value safely.
 * - Returns a SoundCloudError with helpful `status` and `original` fields when possible.
 */
export const handleRequestErrs = (err: unknown): Error => {
  // Axios errors provide helpful shape; treat them specially
  if (isAxiosError(err)) {
    const axiosErr = err as AxiosError
    const status = axiosErr.response?.status
    const code = (axiosErr as any).code as string | undefined

    let descriptiveMessage = axiosErr.message || 'Network error'

    if (status) {
      switch (status) {
        case 400:
          descriptiveMessage = 'Bad request. The API rejected the request payload or parameters.'
          break
        case 401:
          descriptiveMessage = 'Authentication failed. Is your Client ID correct?'
          break
        case 403:
          descriptiveMessage = 'Forbidden. You do not have permission to access this resource.'
          break
        case 404:
          descriptiveMessage = 'Resource not found. It may be private or the URL is incorrect.'
          break
        case 429:
          descriptiveMessage = 'Rate limited by SoundCloud API. Consider retrying after a delay.'
          break
        case 500:
        case 502:
        case 503:
        case 504:
          descriptiveMessage = 'SoundCloud server error. Try again later.'
          break
        default:
          descriptiveMessage = `HTTP ${status} — ${axiosErr.message}`
      }
    } else if (code === 'ECONNABORTED') {
      descriptiveMessage = 'Request timed out.'
    }

    return new SoundCloudError(descriptiveMessage, { status, original: axiosErr, code })
  }

  // If it's already an Error, return as-is (preserve stack).
  if (err instanceof Error) return err

  // Fallback: coerce to string and wrap.
  return new SoundCloudError(String(err ?? 'Unknown error'), { original: err })
}

/**
 * Append search params to a URL in a robust way.
 * Backwards-compatible behavior:
 * - appendURL(url, { key: value, ... }) — preferred
 * - appendURLPairs(url, 'key', 'value', 'other', 'value') — legacy pair-style
 */
export const appendURL = (url: string, params?: Record<string, string | number | undefined>): string => {
  const u = new URL(url)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      u.searchParams.append(k, String(v))
    })
  }
  return u.href
}

/**
 * Legacy helper kept for compatibility with existing callsites that pass flat pairs.
 * Example: appendURLPairs('https://.../path', 'limit', '10', 'offset', '20')
 */
export const appendURLPairs = (url: string, ...params: string[]): string => {
  const u = new URL(url)
  for (let i = 0; i < params.length; i += 2) {
    const key = params[i]
    const value = params[i + 1]
    if (!key || value === undefined) continue
    u.searchParams.append(key, value)
  }
  return u.href
}

/**
 * Extract the personalized-track id from SoundCloud personalized-track URLs.
 * Safer than naive .split(':') and tolerates small format variations.
 */
export const extractIDFromPersonalizedTrackURL = (url: string): string => {
  // expected pattern contains "personalized-tracks::" followed by id
  // example: https://soundcloud.com/discover/sets/personalized-tracks::abcd1234
  try {
    if (!url.includes('personalized-tracks::')) return ''
    const idx = url.indexOf('personalized-tracks::')
    const after = url.slice(idx + 'personalized-tracks::'.length)
    // strip possible trailing query/hash
    const id = after.split(/[?#/]/)[0]
    return id || ''
  } catch (_e) {
    return ''
  }
}

/**
 * Utility for consistently reporting kind mismatches.
 */
export const kindMismatchError = (expected: string, received: string): Error =>
  new SoundCloudError(`Expected resource of kind: (${expected}), received: (${received})`, { original: { expected, received } })

export default {
  resolveURL,
  handleRequestErrs,
  appendURL,
  appendURLPairs,
  extractIDFromPersonalizedTrackURL,
  kindMismatchError,
}
