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
}

// ============================================================================
// FORMAT PRIORITY (Ordered best to worst for automatic selection)
// ============================================================================

/** Ordered list of formats from best to worst for automatic selection */
export const FORMAT_PRIORITY: FORMATS[] = [
  // Lossless
  FORMATS.DSD_512, FORMATS.DSD_256, FORMATS.DSD_128, FORMATS.DSD_64, FORMATS.DSD,
  FORMATS.MQA,
  FORMATS.FLAC_32_384, FORMATS.FLAC_24_192, FORMATS.FLAC_24_96, FORMATS.FLAC_24_48, FORMATS.FLAC_24, FORMATS.FLAC_16, FORMATS.FLAC,
  FORMATS.WAV_32F, FORMATS.WAV_32, FORMATS.WAV_24, FORMATS.WAV_16, FORMATS.WAV,
  FORMATS.AIFF_24, FORMATS.AIFF_16, FORMATS.AIFF,
  FORMATS.ALAC_24, FORMATS.ALAC_16, FORMATS.ALAC,
  FORMATS.WMA_LOSSLESS,
  // High bitrate
  FORMATS.AAC_320, FORMATS.AAC_256,
  FORMATS.MP3_320, FORMATS.MP3_256,
  FORMATS.OGG_VORBIS_500, FORMATS.OGG_VORBIS_320,
  FORMATS.OPUS_256,
  // Standard
  FORMATS.AAC_224, FORMATS.AAC_192, FORMATS.AAC_160,
  FORMATS.MP3_224, FORMATS.MP3_192, FORMATS.MP3_160,
  // Low
  FORMATS.AAC_128, FORMATS.AAC_96,
  FORMATS.MP3_128, FORMATS.MP3_112, FORMATS.MP3_96,
  FORMATS.OPUS_128, FORMATS.OPUS_96,
  // Preview
  FORMATS.AAC_64, FORMATS.AAC_48,
  FORMATS.MP3_64, FORMATS.MP3_48,
  FORMATS.OPUS_64, FORMATS.OPUS_48,
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
  const match = format.toString().match(/(\d+)$/);
  if (match) {
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
