/**
 * Audio formats that SoundCloud tracks can be encoded in
 */
export enum FORMATS {
  MP3 = 'audio/mpeg',
  OPUS = 'audio/ogg; codecs="opus"',
  MP4 = 'audio/mp4',
  AAC = 'audio/aac',
}

/**
 * @deprecated Use FORMATS enum directly
 */
export const _FORMATS = {
  MP3: FORMATS.MP3,
  OPUS: FORMATS.OPUS,
  MP4: FORMATS.MP4,
  AAC: FORMATS.AAC,
} as const

export default FORMATS
