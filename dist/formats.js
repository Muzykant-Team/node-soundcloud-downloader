"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._FORMATS = exports.FORMATS = void 0;
/**
 * Audio formats a track can be encoded in.
 */
var FORMATS;
(function (FORMATS) {
    FORMATS["MP3"] = "audio/mpeg";
    FORMATS["OPUS"] = "audio/ogg; codecs=\"opus\"";
    FORMATS["AAC"] = "audio/aac";
    FORMATS["AAC_LC"] = "audio/aac-lc";
    FORMATS["FLAC"] = "audio/flac";
    FORMATS["WAV"] = "audio/wav";
    FORMATS["WEBM_OPUS"] = "audio/webm; codecs=\"opus\""; // WebM container z Opus
})(FORMATS || (exports.FORMATS = FORMATS = {}));
/** @internal */
exports._FORMATS = {
    MP3: FORMATS.MP3,
    OPUS: FORMATS.OPUS,
    AAC: FORMATS.AAC,
    AAC_LC: FORMATS.AAC_LC,
    FLAC: FORMATS.FLAC,
    WAV: FORMATS.WAV,
    WEBM_OPUS: FORMATS.WEBM_OPUS
};
exports.default = FORMATS;
//# sourceMappingURL=formats.js.map