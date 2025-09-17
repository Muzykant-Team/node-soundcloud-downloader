/**
 * Audio formats a track can be encoded in.
 */
export enum FORMATS {
  MP3 = 'audio/mpeg',
  OPUS = 'audio/ogg; codecs="opus"',
  AAC = 'audio/aac',
  AAC_LC = 'audio/aac-lc',         // Low Complexity AAC
  FLAC = 'audio/flac',
  WAV = 'audio/wav',
  WEBM_OPUS = 'audio/webm; codecs="opus"', // WebM container z Opus
  OGG_VORBIS = 'audio/ogg; codecs="vorbis"', // OGG z Vorbis
  ALAC = 'audio/alac',               // Apple Lossless
  AIFF = 'audio/aiff',               // AIFF PCM
  M4A = 'audio/mp4; codecs="mp4a.40.2"' // AAC w kontenerze M4A
}

/** @internal */
export const _FORMATS = {
  MP3: FORMATS.MP3,
  OPUS: FORMATS.OPUS,
  AAC: FORMATS.AAC,
  AAC_LC: FORMATS.AAC_LC,
  FLAC: FORMATS.FLAC,
  WAV: FORMATS.WAV,
  WEBM_OPUS: FORMATS.WEBM_OPUS,
  OGG_VORBIS: FORMATS.OGG_VORBIS,
  ALAC: FORMATS.ALAC,
  AIFF: FORMATS.AIFF,
  M4A: FORMATS.M4A
};

export default FORMATS;
