import { Transcoding } from './info'
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
    if (snipped) {
      return false
    }

    if (predicate.protocol && format.protocol !== predicate.protocol) {
      return false
    }

    if (predicate.format && format.mime_type !== predicate.format) {
      return false
    }

    return true
  })
}

export default filterMedia
