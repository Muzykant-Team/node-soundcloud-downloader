import type { AxiosError } from 'axios'
import { SoundCloudError } from './info.js'

/**
 * Interface for paginated API responses
 */
export interface PaginatedQuery<T> {
  readonly collection: readonly T[]
  readonly total_results?: number
  readonly next_href: string
  readonly query_urn: string
}

/**
 * SoundCloud API resolve URL
 */
export const RESOLVE_URL = 'https://api-v2.soundcloud.com/resolve' as const

/**
 * Enhanced error handler with better error messages and types
 */
export function handleRequestError(error: unknown, context?: string): never {
  const contextMsg = context ? `${context}: ` : ''
  
  // Handle AxiosError specifically
  if (isAxiosError(error)) {
    const status = error.response?.status
    const statusText = error.response?.statusText || 'Unknown error'
    
    let message = `${contextMsg}${error.message}`
    
    switch (status) {
      case 401:
        message += ' - Invalid or missing client ID'
        break
      case 403:
        message += ' - Access forbidden - track may be private or geo-blocked'
        break
      case 404:
        message += ' - Resource not found - check the URL'
        break
      case 429:
        message += ' - Rate limit exceeded - please try again later'
        break
      case 500:
      case 502:
      case 503:
        message += ' - SoundCloud server error - please try again later'
        break
      default:
        if (status && status >= 400) {
          message += ` - HTTP ${status}: ${statusText}`
        }
    }
    
    throw new SoundCloudError(message, `HTTP_${status}`, status)
  }
  
  // Handle other error types
  if (error instanceof Error) {
    throw new SoundCloudError(`${contextMsg}${error.message}`, 'UNKNOWN_ERROR')
  }
  
  // Handle unknown error types
  throw new SoundCloudError(
    `${contextMsg}An unknown error occurred: ${String(error)}`,
    'UNKNOWN_ERROR'
  )
}

/**
 * Type guard for AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

/**
 * Utility to append query parameters to URL using modern URLSearchParams
 */
export function appendURL(baseUrl: string, ...params: readonly string[]): string {
  if (params.length === 0) {
    return baseUrl
  }
  
  if (params.length % 2 !== 0) {
    throw new Error('Parameters must be provided in key-value pairs')
  }
  
  try {
    const url = new URL(baseUrl)
    
    for (let i = 0; i < params.length; i += 2) {
      const key = params[i]
      const value = params[i + 1]
      
      if (key && value !== undefined) {
        url.searchParams.append(key, value)
      }
    }
    
    return url.href
  } catch (error) {
    throw new Error(`Invalid URL: ${baseUrl}`)
  }
}

/**
 * Extracts track ID from personalized track URLs
 */
export function extractIDFromPersonalizedTrackURL(url: string): string {
  const PERSONALIZED_TRACK_PREFIX = 'https://soundcloud.com/discover/sets/personalized-tracks::'
  
  if (!url.includes(PERSONALIZED_TRACK_PREFIX)) {
    return ''
  }
  
  const parts = url.split(':')
  if (parts.length < 5) {
    return ''
  }
  
  const id = parts[4]
  return id?.match(/^\d+$/) ? id : ''
}

/**
 * Creates a kind mismatch error with better formatting
 */
export function createKindMismatchError(expected: string, received: string): SoundCloudError {
  return new SoundCloudError(
    `Expected resource of kind "${expected}", but received "${received}"`,
    'KIND_MISMATCH'
  )
}
