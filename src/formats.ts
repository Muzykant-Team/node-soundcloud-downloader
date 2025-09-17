enum FORMATS {
  MP3 = 'audio/mpeg',
  OPUS = 'audio/ogg; codecs="opus"',
  AAC = 'audio/mp4; codecs="mp4a.40.2"',
  FLAC = 'audio/flac',
  WAV = 'audio/wav'
}

export const _FORMATS = {
  MP3: FORMATS.MP3,
  OPUS: FORMATS.OPUS,
  AAC: FORMATS.AAC,
  FLAC: FORMATS.FLAC,
  WAV: FORMATS.WAV
} as const

export default FORMATS
