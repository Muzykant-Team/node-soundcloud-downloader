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
  WEBM_OPUS = 'audio/webm; codecs="opus"' // WebM container z Opus
}

/** @internal */
export const _FORMATS = {
  MP3: FORMATS.MP3,
  OPUS: FORMATS.OPUS,
  AAC: FORMATS.AAC,
  AAC_LC: FORMATS.AAC_LC,
  FLAC: FORMATS.FLAC,
  WAV: FORMATS.WAV,
  WEBM_OPUS: FORMATS.WEBM_OPUS
};

export default FORMATS;
