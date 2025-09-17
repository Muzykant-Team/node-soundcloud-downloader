import type { Transcoding } from './info.js'
import type FORMATS from './formats.js'
import type STREAMING_PROTOCOLS from './protocols.js'

export interface FilterPredicateObject {
  protocol?: STREAMING_PROTOCOLS
  format?: FORMATS
}

const filterMedia = (media: Transcoding[], predicateObj: FilterPredicateObject): Transcoding[] => {
  return media.filter(({ format, snipped }) => {
    if (snipped) return false
    if (predicateObj.protocol && format.protocol !== predicateObj.protocol) return false
    if (predicateObj.format && format.mime_type !== predicateObj.format) return false
    return true
  })
}

export default filterMedia
