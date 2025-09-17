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
    
    let match = false
    if (predicateObj.protocol) match = format.protocol === predicateObj.protocol
    if (predicateObj.format) match = format.mime_type === predicateObj.format
    
    return match
  })
}

export default filterMedia
