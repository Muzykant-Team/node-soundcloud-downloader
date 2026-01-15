import type { Transcoding } from './info'
import FORMATS from './formats'
import STREAMING_PROTOCOLS from './protocols'

export interface FilterPredicateObject {
  protocol?: STREAMING_PROTOCOLS
  format?: FORMATS
}

/** @internal */
const filterMedia = (
  media: Transcoding[],
  predicate: FilterPredicateObject
): Transcoding[] => {
  return media.filter(({ format, snipped }) => {
    // Odrzuć snippety
    if (snipped) {
      return false
    }
    
    // Sprawdź protokół jeśli podany
    if (predicate.protocol !== undefined && format.protocol !== predicate.protocol) {
      return false
    }
    
    // Sprawdź format jeśli podany
    if (predicate.format !== undefined && format.mime_type !== predicate.format) {
      return false
    }
    
    return true
  })
}

export default filterMedia
