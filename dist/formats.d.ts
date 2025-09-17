/**
 * Audio formats a track can be encoded in.
 */
export declare enum FORMATS {
    MP3 = "audio/mpeg",
    OPUS = "audio/ogg; codecs=\"opus\"",
    AAC = "audio/aac",
    AAC_LC = "audio/aac-lc",// Low Complexity AAC
    FLAC = "audio/flac",
    WAV = "audio/wav",
    WEBM_OPUS = "audio/webm; codecs=\"opus\""
}
/** @internal */
export declare const _FORMATS: {
    MP3: FORMATS;
    OPUS: FORMATS;
    AAC: FORMATS;
    AAC_LC: FORMATS;
    FLAC: FORMATS;
    WAV: FORMATS;
    WEBM_OPUS: FORMATS;
};
export default FORMATS;
