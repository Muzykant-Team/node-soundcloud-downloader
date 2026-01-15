/**
 * Complete Audio Format Support for SoundCloud
 * 
 * Formats are organized from HIGHEST to LOWEST quality:
 * 1. Lossless (FLAC, WAV, AIFF, ALAC, DSD)
 * 2. High-Res/Premium (256kbps+)
 * 3. Standard (128-192kbps)
 * 4. Low/Preview (64-96kbps)
 * 5. Legacy/Deprecated
 * 
 * @module formats
 */

// ============================================================================
// QUALITY TIERS
// ============================================================================

/** SoundCloud quality tiers (highest to lowest) */
export enum QUALITY_TIER {
  /** Lossless - FLAC, WAV, AIFF, ALAC */
  LOSSLESS = 'lossless',
  /** Go+ Premium - 256kbps AAC */
  PREMIUM = 'premium',
  /** High quality - 192kbps */
  HIGH = 'high',
  /** Standard quality - 160kbps (default) */
  STANDARD = 'standard',
  /** Low quality - 128kbps */
  LOW = 'low',
  /** Preview/Ultra low - 64-96kbps */
  PREVIEW = 'preview',
}

// ============================================================================
// AUDIO FORMATS (Ordered from BEST to WORST quality)
// ============================================================================

/**
 * All audio formats supported by SoundCloud.
 * 
 * **Order: Best quality → Worst quality**
 */
export enum FORMATS {
  // ==========================================================================
  // 1. LOSSLESS FORMATS (Best Quality - No compression loss)
  // ==========================================================================

  /** DSD 512 - Direct Stream Digital (highest) */
  DSD_512 = 'audio/dsd',
  /** DSD 256 */
  DSD_256 = 'audio/dsd',
  /** DSD 128 */
  DSD_128 = 'audio/dsd',
  /** DSD 64 - Standard DSD */
  DSD_64 = 'audio/dsd',
  /** DSD generic */
  DSD = 'audio/dsd',

  /** MQA - Master Quality Authenticated */
  MQA = 'audio/mqa',

  /** FLAC 32-bit/384kHz Hi-Res */
  FLAC_32_384 = 'audio/flac',
  /** FLAC 24-bit/192kHz Hi-Res */
  FLAC_24_192 = 'audio/flac',
  /** FLAC 24-bit/96kHz Hi-Res */
  FLAC_24_96 = 'audio/flac',
  /** FLAC 24-bit/48kHz Hi-Res */
  FLAC_24_48 = 'audio/flac',
  /** FLAC 24-bit generic */
  FLAC_24 = 'audio/flac',
  /** FLAC 16-bit CD quality */
  FLAC_16 = 'audio/flac',
  /** FLAC generic */
  FLAC = 'audio/flac',

  /** WAV 32-bit float */
  WAV_32F = 'audio/wav',
  /** WAV 32-bit integer */
  WAV_32 = 'audio/wav',
  /** WAV 24-bit */
  WAV_24 = 'audio/wav',
  /** WAV 16-bit CD quality */
  WAV_16 = 'audio/wav',
  /** WAV generic */
  WAV = 'audio/wav',

  /** AIFF 24-bit */
  AIFF_24 = 'audio/aiff',
  /** AIFF 16-bit */
  AIFF_16 = 'audio/aiff',
  /** AIFF generic */
  AIFF = 'audio/aiff',

  /** Apple Lossless 24-bit */
  ALAC_24 = 'audio/alac',
  /** Apple Lossless 16-bit */
  ALAC_16 = 'audio/alac',
  /** Apple Lossless generic */
  ALAC = 'audio/alac',

  /** WMA Lossless */
  WMA_LOSSLESS = 'audio/x-ms-wma',

  /** Monkey's Audio (APE) */
  APE = 'audio/ape',
  /** True Audio (TTA) */
  TTA = 'audio/tta',
  /** WavPack */
  WAVPACK = 'audio/wavpack',
  /** WavPack Hybrid (lossy+correction) */
  WAVPACK_HYBRID = 'audio/wavpack',
  /** Musepack / MPC */
  MUSEPACK = 'audio/musepack',
  /** OptimFROG */
  OPTIMFROG = 'audio/ofr',
  /** Shorten */
  SHORTEN = 'audio/shn',
  /** TAK (Tom's Audio Kompressor) */
  TAK = 'audio/tak',
  /** LA (Lossless Audio) */
  LA = 'audio/la',
  /** ATRAC Advanced Lossless */
  ATRAC_AL = 'audio/atrac-al',
  /** FLAC in Matroska container */
  MKA_FLAC = 'audio/x-matroska',

  // --------------------------------------------------------------------------
  // HLS/Streaming Lossless
  // --------------------------------------------------------------------------

  /** HLS ALAC (Apple Lossless over HLS) */
  HLS_ALAC = 'application/vnd.apple.mpegurl',
  /** HLS FLAC */
  HLS_FLAC = 'application/vnd.apple.mpegurl',
  /** HLS PCM */
  HLS_PCM = 'application/vnd.apple.mpegurl',
  /** DASH FLAC */
  DASH_FLAC = 'application/dash+xml',
  /** DASH ALAC */
  DASH_ALAC = 'application/dash+xml',

  // ==========================================================================
  // 2. HIGH BITRATE LOSSY (Premium Quality - 256kbps+)
  // ==========================================================================

  /** AAC 320kbps (if available) */
  AAC_320 = 'audio/mp4; codecs="mp4a.40.2"',
  /** AAC 256kbps - Go+ Premium */
  AAC_256 = 'audio/mp4; codecs="mp4a.40.2"',

  /** MP3 320kbps - Highest MP3 */
  MP3_320 = 'audio/mpeg',
  /** MP3 256kbps */
  MP3_256 = 'audio/mpeg',

  /** Ogg Vorbis 500kbps */
  OGG_VORBIS_500 = 'audio/ogg; codecs="vorbis"',
  /** Ogg Vorbis 320kbps */
  OGG_VORBIS_320 = 'audio/ogg; codecs="vorbis"',

  /** Opus 256kbps */
  OPUS_256 = 'audio/ogg; codecs="opus"',

  // --------------------------------------------------------------------------
  // HLS/DASH High Bitrate AAC
  // --------------------------------------------------------------------------

  /** HLS AAC 320kbps */
  HLS_AAC_320 = 'application/vnd.apple.mpegurl',
  /** HLS AAC 256kbps - Go+ Premium streaming */
  HLS_AAC_256 = 'application/vnd.apple.mpegurl',
  /** DASH AAC 320kbps */
  DASH_AAC_320 = 'application/dash+xml',
  /** DASH AAC 256kbps */
  DASH_AAC_256 = 'application/dash+xml',

  // ==========================================================================
  // 3. STANDARD BITRATE (Good Quality - 160-224kbps)
  // ==========================================================================

  /** AAC 224kbps */
  AAC_224 = 'audio/mp4; codecs="mp4a.40.2"',
  /** AAC 192kbps */
  AAC_192 = 'audio/mp4; codecs="mp4a.40.2"',
  /** AAC 160kbps - Default SoundCloud HLS */
  AAC_160 = 'audio/mp4; codecs="mp4a.40.2"',

  /** MP3 224kbps */
  MP3_224 = 'audio/mpeg',
  /** MP3 192kbps */
  MP3_192 = 'audio/mpeg',
  /** MP3 160kbps */
  MP3_160 = 'audio/mpeg',

  /** Ogg Vorbis 192kbps */
  OGG_VORBIS_192 = 'audio/ogg; codecs="vorbis"',
  /** Ogg Vorbis 160kbps */
  OGG_VORBIS_160 = 'audio/ogg; codecs="vorbis"',

  /** Opus 160kbps */
  OPUS_160 = 'audio/ogg; codecs="opus"',

  /** HLS AAC 192kbps */
  HLS_AAC_192 = 'application/vnd.apple.mpegurl',
  /** HLS AAC 160kbps - SoundCloud default */
  HLS_AAC_160 = 'application/vnd.apple.mpegurl',
  /** DASH AAC 192kbps */
  DASH_AAC_192 = 'application/dash+xml',
  /** DASH AAC 160kbps */
  DASH_AAC_160 = 'application/dash+xml',

  // ==========================================================================
  // 4. LOW BITRATE (Standard Quality - 96-128kbps)
  // ==========================================================================

  /** AAC 128kbps */
  AAC_128 = 'audio/mp4; codecs="mp4a.40.2"',
  /** AAC 96kbps - HLS fallback */
  AAC_96 = 'audio/mp4; codecs="mp4a.40.5"',

  /** MP3 128kbps - Legacy free tier */
  MP3_128 = 'audio/mpeg',
  /** MP3 112kbps */
  MP3_112 = 'audio/mpeg',
  /** MP3 96kbps */
  MP3_96 = 'audio/mpeg',

  /** Opus 128kbps */
  OPUS_128 = 'audio/ogg; codecs="opus"',
  /** Opus 96kbps */
  OPUS_96 = 'audio/ogg; codecs="opus"',

  /** Ogg Vorbis 128kbps */
  OGG_VORBIS_128 = 'audio/ogg; codecs="vorbis"',
  /** Ogg Vorbis 96kbps */
  OGG_VORBIS_96 = 'audio/ogg; codecs="vorbis"',

  /** HLS AAC 128kbps */
  HLS_AAC_128 = 'application/vnd.apple.mpegurl',
  /** HLS AAC 96kbps - SoundCloud fallback */
  HLS_AAC_96 = 'application/vnd.apple.mpegurl',
  /** DASH AAC 128kbps */
  DASH_AAC_128 = 'application/dash+xml',
  /** DASH AAC 96kbps */
  DASH_AAC_96 = 'application/dash+xml',

  // ==========================================================================
  // 5. PREVIEW / ULTRA LOW BITRATE (32-64kbps)
  // ==========================================================================

  /** AAC 64kbps - Low bandwidth */
  AAC_64 = 'audio/mp4; codecs="mp4a.40.29"',
  /** AAC 48kbps - Ultra low */
  AAC_48 = 'audio/mp4; codecs="mp4a.40.29"',
  /** AAC 32kbps - Minimum */
  AAC_32 = 'audio/mp4; codecs="mp4a.40.29"',

  /** MP3 64kbps */
  MP3_64 = 'audio/mpeg',
  /** MP3 48kbps */
  MP3_48 = 'audio/mpeg',
  /** MP3 32kbps */
  MP3_32 = 'audio/mpeg',

  /** Opus 64kbps - Legacy low bandwidth */
  OPUS_64 = 'audio/ogg; codecs="opus"',
  /** Opus 48kbps */
  OPUS_48 = 'audio/ogg; codecs="opus"',
  /** Opus 32kbps */
  OPUS_32 = 'audio/ogg; codecs="opus"',

  /** HLS AAC 64kbps */
  HLS_AAC_64 = 'application/vnd.apple.mpegurl',
  /** HLS AAC 48kbps */
  HLS_AAC_48 = 'application/vnd.apple.mpegurl',
  /** DASH AAC 64kbps */
  DASH_AAC_64 = 'application/dash+xml',
  /** DASH AAC 48kbps */
  DASH_AAC_48 = 'application/dash+xml',

  /** MP3 Preview */
  MP3_PREVIEW = 'audio/mpeg',

  // ==========================================================================
  // 6. GENERIC / CONTAINER FORMATS
  // ==========================================================================

  /** AAC generic (default profile) */
  AAC = 'audio/mp4; codecs="mp4a.40.2"',
  /** AAC-LC (Low Complexity) */
  AAC_LC = 'audio/aac',
  /** AAC-HE v1 (SBR) */
  AAC_HE = 'audio/mp4; codecs="mp4a.40.5"',
  /** AAC-HE v2 (SBR + PS) */
  AAC_HE_V2 = 'audio/mp4; codecs="mp4a.40.29"',
  /** xHE-AAC (Extended HE-AAC) */
  AAC_XHE = 'audio/mp4; codecs="mp4a.40.42"',

  /** MP3 generic */
  MP3 = 'audio/mpeg',
  /** MP2 (MPEG Layer II) */
  MP2 = 'audio/mpeg',
  /** MP1 (MPEG Layer I) */
  MP1 = 'audio/mpeg',

  /** Opus generic */
  OPUS = 'audio/ogg; codecs="opus"',
  /** Opus in WebM container */
  WEBM_OPUS = 'audio/webm; codecs="opus"',

  /** Ogg Vorbis generic */
  OGG_VORBIS = 'audio/ogg; codecs="vorbis"',
  /** Ogg generic */
  OGG = 'audio/ogg',

  /** M4A container */
  M4A = 'audio/mp4',
  /** MP4 audio */
  MP4_AUDIO = 'audio/mp4',

  // ==========================================================================
  // 7. SURROUND / MULTICHANNEL
  // ==========================================================================

  /** Dolby Digital (AC-3) */
  AC3 = 'audio/ac3',
  /** Dolby Digital Plus (E-AC-3) */
  EAC3 = 'audio/eac3',
  /** Dolby Atmos */
  DOLBY_ATMOS = 'audio/eac3-joc',
  /** DTS */
  DTS = 'audio/vnd.dts',
  /** DTS-HD */
  DTS_HD = 'audio/vnd.dts.hd',
  /** DTS:X */
  DTS_X = 'audio/vnd.dts.uhd',

  // ==========================================================================
  // 8. MOBILE / VOICE FORMATS
  // ==========================================================================

  /** AMR Narrowband */
  AMR_NB = 'audio/amr',
  /** AMR Wideband */
  AMR_WB = 'audio/amr-wb',
  /** AMR generic */
  AMR = 'audio/amr',

  /** 3GPP audio */
  THREE_GPP = 'audio/3gpp',
  /** 3GPP2 audio */
  THREE_GPP2 = 'audio/3gpp2',

  /** GSM */
  GSM = 'audio/gsm',
  /** G.711 μ-law */
  G711_ULAW = 'audio/basic',
  /** G.711 A-law */
  G711_ALAW = 'audio/x-alaw-basic',

  // ==========================================================================
  // 9. LEGACY / OTHER FORMATS
  // ==========================================================================

  /** Windows Media Audio */
  WMA = 'audio/x-ms-wma',
  /** WMA Pro */
  WMA_PRO = 'audio/x-ms-wma',
  /** WMA Voice */
  WMA_VOICE = 'audio/x-ms-wma',

  /** RealAudio */
  REAL_AUDIO = 'audio/vnd.rn-realaudio',

  /** Apple CAF */
  CAF = 'audio/x-caf',
  /** AU / SND (Sun/NeXT) */
  AU = 'audio/basic',
  SND = 'audio/basic',

  /** RAW PCM */
  PCM_RAW = 'audio/L16',
  /** PCM signed 16-bit */
  PCM_S16LE = 'audio/L16',
  /** PCM signed 24-bit */
  PCM_S24LE = 'audio/L24',
  /** PCM float 32-bit */
  PCM_F32LE = 'audio/L32',

  /** MIDI */
  MIDI = 'audio/midi',
  /** MIDI Standard */
  MID = 'audio/midi',

  /** Speex */
  SPEEX = 'audio/ogg; codecs="speex"',

  /** AC4 */
  AC4 = 'audio/ac4',

  /** MPEG-H Audio */
  MPEGH = 'audio/mhas',

  // ==========================================================================
  // 11. SONY / PLAYSTATION FORMATS
  // ==========================================================================

  /** Sony ATRAC */
  ATRAC = 'audio/atrac',
  /** ATRAC3 */
  ATRAC3 = 'audio/atrac3',
  /** ATRAC3+ */
  ATRAC3_PLUS = 'audio/atrac3plus',
  /** ATRAC9 */
  ATRAC9 = 'audio/atrac9',

  // ==========================================================================
  // 12. GAME / MULTIMEDIA FORMATS
  // ==========================================================================

  /** XMA (Xbox Media Audio) */
  XMA = 'audio/xma',
  /** XMA2 */
  XMA2 = 'audio/xma2',
  /** BINK Audio */
  BINK = 'audio/bink',
  /** Vorbis in Matroska */
  MKA_VORBIS = 'audio/x-matroska',
  /** Generic Matroska Audio */
  MKA = 'audio/x-matroska',

  // ==========================================================================
  // 13. FUTURE / EXPERIMENTAL CODECS
  // ==========================================================================

  /** AV1 Audio (experimental) */
  AV1_AUDIO = 'audio/av1',
  /** USAC (Unified Speech and Audio Coding) */
  USAC = 'audio/usac',
  /** EVS (Enhanced Voice Services) */
  EVS = 'audio/evs',
  /** LC3 (Low Complexity Communication Codec) */
  LC3 = 'audio/lc3',
  /** LC3plus */
  LC3_PLUS = 'audio/lc3plus',
  /** Lyra (Google) */
  LYRA = 'audio/lyra',
  /** Satin (Google) */
  SATIN = 'audio/satin',
  /** Encodec (Meta) */
  ENCODEC = 'audio/encodec',
  /** SoundStream */
  SOUNDSTREAM = 'audio/soundstream',

  // ==========================================================================
  // 14. STREAMING SPECIFIC
  // ==========================================================================

  /** HLS Audio AAC */
  HLS_AAC = 'application/vnd.apple.mpegurl',
  /** HLS Audio fMP4 */
  HLS_FMP4 = 'application/vnd.apple.mpegurl',
  /** DASH Audio */
  DASH = 'application/dash+xml',
  /** Smooth Streaming Audio */
  SMOOTH = 'application/vnd.ms-sstr+xml',

  // ==========================================================================
  // 15. CATCH-ALL / FALLBACK (Last resort)
  // ==========================================================================

  /** HLS Any - accept any HLS stream */
  HLS_ANY = 'application/vnd.apple.mpegurl',
  /** DASH Any - accept any DASH stream */
  DASH_ANY = 'application/dash+xml',
  /** Audio Any - accept any audio format */
  AUDIO_ANY = 'audio/*',
}

// ============================================================================
// FORMAT PRIORITY (Ordered best to worst for automatic selection)
// ============================================================================

/** Ordered list of formats from BEST to WORST for automatic selection */
export const FORMAT_PRIORITY: FORMATS[] = [
  // ========== 1. LOSSLESS (Best Quality) ==========
  // DSD (highest resolution)
  FORMATS.DSD_512, FORMATS.DSD_256, FORMATS.DSD_128, FORMATS.DSD_64, FORMATS.DSD,
  // MQA
  FORMATS.MQA,
  // FLAC (by bit depth and sample rate)
  FORMATS.FLAC_32_384, FORMATS.FLAC_24_192, FORMATS.FLAC_24_96, FORMATS.FLAC_24_48, FORMATS.FLAC_24, FORMATS.FLAC_16, FORMATS.FLAC,
  // WAV
  FORMATS.WAV_32F, FORMATS.WAV_32, FORMATS.WAV_24, FORMATS.WAV_16, FORMATS.WAV,
  // AIFF
  FORMATS.AIFF_24, FORMATS.AIFF_16, FORMATS.AIFF,
  // ALAC
  FORMATS.ALAC_24, FORMATS.ALAC_16, FORMATS.ALAC,
  // Other lossless
  FORMATS.WMA_LOSSLESS, FORMATS.APE, FORMATS.TTA, FORMATS.WAVPACK, FORMATS.WAVPACK_HYBRID,
  FORMATS.MUSEPACK, FORMATS.OPTIMFROG, FORMATS.SHORTEN, FORMATS.TAK, FORMATS.LA,
  FORMATS.ATRAC_AL, FORMATS.MKA_FLAC,
  // HLS/DASH Lossless
  FORMATS.HLS_ALAC, FORMATS.HLS_FLAC, FORMATS.HLS_PCM, FORMATS.DASH_FLAC, FORMATS.DASH_ALAC,

  // ========== 2. HIGH BITRATE (256kbps+) ==========
  FORMATS.AAC_320, FORMATS.AAC_256,
  FORMATS.MP3_320, FORMATS.MP3_256,
  FORMATS.OGG_VORBIS_500, FORMATS.OGG_VORBIS_320,
  FORMATS.OPUS_256,
  // HLS/DASH High Bitrate
  FORMATS.HLS_AAC_320, FORMATS.HLS_AAC_256, FORMATS.DASH_AAC_320, FORMATS.DASH_AAC_256,

  // ========== 3. STANDARD QUALITY (160-224kbps) ==========
  FORMATS.AAC_224, FORMATS.AAC_192, FORMATS.AAC_160,
  FORMATS.MP3_224, FORMATS.MP3_192, FORMATS.MP3_160,
  FORMATS.OGG_VORBIS_192, FORMATS.OGG_VORBIS_160,
  FORMATS.OPUS_160,
  // HLS/DASH Standard
  FORMATS.HLS_AAC_192, FORMATS.HLS_AAC_160, FORMATS.DASH_AAC_192, FORMATS.DASH_AAC_160,

  // ========== 4. LOW QUALITY (96-128kbps) ==========
  FORMATS.AAC_128, FORMATS.AAC_96,
  FORMATS.MP3_128, FORMATS.MP3_112, FORMATS.MP3_96,
  FORMATS.OPUS_128, FORMATS.OPUS_96,
  FORMATS.OGG_VORBIS_128, FORMATS.OGG_VORBIS_96,
  // HLS/DASH Low
  FORMATS.HLS_AAC_128, FORMATS.HLS_AAC_96, FORMATS.DASH_AAC_128, FORMATS.DASH_AAC_96,

  // ========== 5. PREVIEW / ULTRA LOW (32-64kbps) ==========
  FORMATS.AAC_64, FORMATS.AAC_48, FORMATS.AAC_32,
  FORMATS.MP3_64, FORMATS.MP3_48, FORMATS.MP3_32,
  FORMATS.OPUS_64, FORMATS.OPUS_48, FORMATS.OPUS_32,
  FORMATS.MP3_PREVIEW,
  // HLS/DASH Preview
  FORMATS.HLS_AAC_64, FORMATS.HLS_AAC_48, FORMATS.DASH_AAC_64, FORMATS.DASH_AAC_48,

  // ========== 6. GENERIC FORMATS ==========
  FORMATS.AAC, FORMATS.AAC_LC, FORMATS.AAC_HE, FORMATS.AAC_HE_V2, FORMATS.AAC_XHE,
  FORMATS.MP3, FORMATS.OPUS, FORMATS.WEBM_OPUS,
  FORMATS.OGG_VORBIS, FORMATS.OGG,
  FORMATS.M4A, FORMATS.MP4_AUDIO,

  // ========== 7. SURROUND / MULTICHANNEL ==========
  FORMATS.DOLBY_ATMOS, FORMATS.EAC3, FORMATS.AC3,
  FORMATS.DTS_X, FORMATS.DTS_HD, FORMATS.DTS,

  // ========== 8. SONY / GAME FORMATS ==========
  FORMATS.ATRAC9, FORMATS.ATRAC3_PLUS, FORMATS.ATRAC3, FORMATS.ATRAC,
  FORMATS.XMA2, FORMATS.XMA, FORMATS.BINK,

  // ========== 9. FUTURE / EXPERIMENTAL ==========
  FORMATS.MPEGH, FORMATS.USAC, FORMATS.AC4,
  FORMATS.LC3_PLUS, FORMATS.LC3, FORMATS.EVS,
  FORMATS.LYRA, FORMATS.SATIN, FORMATS.ENCODEC, FORMATS.SOUNDSTREAM, FORMATS.AV1_AUDIO,

  // ========== 10. STREAMING ==========
  FORMATS.HLS_AAC, FORMATS.HLS_FMP4, FORMATS.DASH, FORMATS.SMOOTH,

  // ========== 11. VOICE / MOBILE ==========
  FORMATS.AMR_WB, FORMATS.AMR_NB, FORMATS.AMR,
  FORMATS.EVS, FORMATS.GSM,
  FORMATS.G711_ULAW, FORMATS.G711_ALAW,
  FORMATS.THREE_GPP, FORMATS.THREE_GPP2,

  // ========== 12. LEGACY / OTHER ==========
  FORMATS.MP2, FORMATS.MP1,
  FORMATS.WMA_PRO, FORMATS.WMA_VOICE, FORMATS.WMA,
  FORMATS.REAL_AUDIO, FORMATS.SPEEX,
  FORMATS.CAF, FORMATS.MKA, FORMATS.MKA_VORBIS,
  FORMATS.AU, FORMATS.SND,
  FORMATS.PCM_F32LE, FORMATS.PCM_S24LE, FORMATS.PCM_S16LE, FORMATS.PCM_RAW,
  FORMATS.MIDI, FORMATS.MID,

  // ========== 13. CATCH-ALL / FALLBACK (Last resort) ==========
  FORMATS.HLS_ANY, FORMATS.DASH_ANY, FORMATS.AUDIO_ANY,
];

// ============================================================================
// INTERNAL FORMAT MAP
// ============================================================================

/** @internal */
export const _FORMATS = Object.fromEntries(
  Object.entries(FORMATS).map(([key, value]) => [key, value])
) as Record<keyof typeof FORMATS, FORMATS>;

// ============================================================================
// FORMAT SETS (for quick lookups)
// ============================================================================

const LOSSLESS_SET = new Set<FORMATS>([
  FORMATS.DSD_512, FORMATS.DSD_256, FORMATS.DSD_128, FORMATS.DSD_64, FORMATS.DSD,
  FORMATS.MQA,
  FORMATS.FLAC_32_384, FORMATS.FLAC_24_192, FORMATS.FLAC_24_96, FORMATS.FLAC_24_48, FORMATS.FLAC_24, FORMATS.FLAC_16, FORMATS.FLAC,
  FORMATS.WAV_32F, FORMATS.WAV_32, FORMATS.WAV_24, FORMATS.WAV_16, FORMATS.WAV,
  FORMATS.AIFF_24, FORMATS.AIFF_16, FORMATS.AIFF,
  FORMATS.ALAC_24, FORMATS.ALAC_16, FORMATS.ALAC,
  FORMATS.WMA_LOSSLESS,
]);

const AAC_SET = new Set<FORMATS>([
  FORMATS.AAC_320, FORMATS.AAC_256, FORMATS.AAC_224, FORMATS.AAC_192, FORMATS.AAC_160,
  FORMATS.AAC_128, FORMATS.AAC_96, FORMATS.AAC_64, FORMATS.AAC_48, FORMATS.AAC_32,
  FORMATS.AAC, FORMATS.AAC_LC, FORMATS.AAC_HE, FORMATS.AAC_HE_V2, FORMATS.AAC_XHE, FORMATS.M4A,
]);

const PREMIUM_SET = new Set<FORMATS>([
  ...LOSSLESS_SET,
  FORMATS.AAC_320, FORMATS.AAC_256,
  FORMATS.MP3_320, FORMATS.MP3_256,
]);

const DEPRECATED_SET = new Set<FORMATS>([
  FORMATS.OPUS, FORMATS.OPUS_256, FORMATS.OPUS_160, FORMATS.OPUS_128, FORMATS.OPUS_96, FORMATS.OPUS_64, FORMATS.OPUS_48, FORMATS.OPUS_32,
  FORMATS.WEBM_OPUS,
  FORMATS.OGG_VORBIS, FORMATS.OGG_VORBIS_500, FORMATS.OGG_VORBIS_320, FORMATS.OGG_VORBIS_192, FORMATS.OGG_VORBIS_160, FORMATS.OGG_VORBIS_128, FORMATS.OGG_VORBIS_96,
]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Check if format is lossless */
export const isLosslessFormat = (format: FORMATS): boolean => LOSSLESS_SET.has(format);

/** Check if format is AAC-based (recommended 2026+) */
export const isAACFormat = (format: FORMATS): boolean => AAC_SET.has(format);

/** Check if format requires Go+ Premium */
export const isPremiumFormat = (format: FORMATS): boolean => PREMIUM_SET.has(format);

/** Check if format is deprecated for HLS (Dec 2025) */
export const isDeprecatedFormat = (format: FORMATS): boolean => DEPRECATED_SET.has(format);

/** Get recommended format for quality tier */
export const getFormatForTier = (tier: QUALITY_TIER): FORMATS => {
  switch (tier) {
    case QUALITY_TIER.LOSSLESS: return FORMATS.FLAC;
    case QUALITY_TIER.PREMIUM: return FORMATS.AAC_256;
    case QUALITY_TIER.HIGH: return FORMATS.AAC_192;
    case QUALITY_TIER.STANDARD: return FORMATS.AAC_160;
    case QUALITY_TIER.LOW: return FORMATS.AAC_128;
    case QUALITY_TIER.PREVIEW: return FORMATS.AAC_64;
    default: return FORMATS.AAC_160;
  }
};

/** Get bitrate in kbps (0 if unknown/lossless) */
export const getFormatBitrate = (format: FORMATS): number => {
  const formatStr = String(format);
  const match = formatStr.match(/(\d+)$/);
  if (match?.[1]) {
    const num = parseInt(match[1], 10);
    // Filter out codec numbers and sample rates
    if (num <= 512 && num !== 40 && num !== 42 && num !== 29 && num !== 5 && num !== 2) {
      return num;
    }
  }
  // Special cases
  switch (format) {
    case FORMATS.AAC_320: case FORMATS.MP3_320: case FORMATS.OGG_VORBIS_320: return 320;
    case FORMATS.AAC_256: case FORMATS.MP3_256: case FORMATS.OPUS_256: return 256;
    case FORMATS.AAC_224: case FORMATS.MP3_224: return 224;
    case FORMATS.AAC_192: case FORMATS.MP3_192: case FORMATS.OGG_VORBIS_192: return 192;
    case FORMATS.AAC_160: case FORMATS.MP3_160: case FORMATS.OGG_VORBIS_160: case FORMATS.OPUS_160: return 160;
    case FORMATS.AAC_128: case FORMATS.MP3_128: case FORMATS.OPUS_128: case FORMATS.OGG_VORBIS_128: return 128;
    case FORMATS.AAC_96: case FORMATS.MP3_96: case FORMATS.OPUS_96: case FORMATS.OGG_VORBIS_96: return 96;
    case FORMATS.AAC_64: case FORMATS.MP3_64: case FORMATS.OPUS_64: return 64;
    case FORMATS.AAC_48: case FORMATS.MP3_48: case FORMATS.OPUS_48: return 48;
    case FORMATS.AAC_32: case FORMATS.MP3_32: case FORMATS.OPUS_32: return 32;
    default: return 0; // Unknown or lossless
  }
};

/** Get best available format from a list of available formats */
export const getBestFormat = (available: FORMATS[]): FORMATS | undefined => {
  for (const format of FORMAT_PRIORITY) {
    if (available.includes(format)) {
      return format;
    }
  }
  return available[0];
};

/** Compare two formats (for sorting, negative = first is better) */
export const compareFormats = (a: FORMATS, b: FORMATS): number => {
  const indexA = FORMAT_PRIORITY.indexOf(a);
  const indexB = FORMAT_PRIORITY.indexOf(b);
  const posA = indexA === -1 ? FORMAT_PRIORITY.length : indexA;
  const posB = indexB === -1 ? FORMAT_PRIORITY.length : indexB;
  return posA - posB;
};

export default FORMATS;
