import m3u8stream from "m3u8stream";
import { AxiosInstance } from "axios";
//#region src/protocols.d.ts
/**
 * Soundcloud streams tracks using these protocols.
 */
declare enum STREAMING_PROTOCOLS {
  HLS = "hls",
  PROGRESSIVE = "progressive"
}
//#endregion
//#region src/formats.d.ts
/**
 * All audio formats supported by SoundCloud.
 *
 * **Order: Best quality → Worst quality**
 */
declare enum FORMATS {
  /** DSD 512 - Direct Stream Digital (highest) */
  DSD_512 = "audio/dsd",
  /** DSD 256 */
  DSD_256 = "audio/dsd",
  /** DSD 128 */
  DSD_128 = "audio/dsd",
  /** DSD 64 - Standard DSD */
  DSD_64 = "audio/dsd",
  /** DSD generic */
  DSD = "audio/dsd",
  /** MQA - Master Quality Authenticated */
  MQA = "audio/mqa",
  /** FLAC 32-bit/384kHz Hi-Res */
  FLAC_32_384 = "audio/flac",
  /** FLAC 24-bit/192kHz Hi-Res */
  FLAC_24_192 = "audio/flac",
  /** FLAC 24-bit/96kHz Hi-Res */
  FLAC_24_96 = "audio/flac",
  /** FLAC 24-bit/48kHz Hi-Res */
  FLAC_24_48 = "audio/flac",
  /** FLAC 24-bit generic */
  FLAC_24 = "audio/flac",
  /** FLAC 16-bit CD quality */
  FLAC_16 = "audio/flac",
  /** FLAC generic */
  FLAC = "audio/flac",
  /** WAV 32-bit float */
  WAV_32F = "audio/wav",
  /** WAV 32-bit integer */
  WAV_32 = "audio/wav",
  /** WAV 24-bit */
  WAV_24 = "audio/wav",
  /** WAV 16-bit CD quality */
  WAV_16 = "audio/wav",
  /** WAV generic */
  WAV = "audio/wav",
  /** AIFF 24-bit */
  AIFF_24 = "audio/aiff",
  /** AIFF 16-bit */
  AIFF_16 = "audio/aiff",
  /** AIFF generic */
  AIFF = "audio/aiff",
  /** Apple Lossless 24-bit */
  ALAC_24 = "audio/alac",
  /** Apple Lossless 16-bit */
  ALAC_16 = "audio/alac",
  /** Apple Lossless generic */
  ALAC = "audio/alac",
  /** WMA Lossless */
  WMA_LOSSLESS = "audio/x-ms-wma",
  /** Monkey's Audio (APE) */
  APE = "audio/ape",
  /** True Audio (TTA) */
  TTA = "audio/tta",
  /** WavPack */
  WAVPACK = "audio/wavpack",
  /** WavPack Hybrid (lossy+correction) */
  WAVPACK_HYBRID = "audio/wavpack",
  /** Musepack / MPC */
  MUSEPACK = "audio/musepack",
  /** OptimFROG */
  OPTIMFROG = "audio/ofr",
  /** Shorten */
  SHORTEN = "audio/shn",
  /** TAK (Tom's Audio Kompressor) */
  TAK = "audio/tak",
  /** LA (Lossless Audio) */
  LA = "audio/la",
  /** ATRAC Advanced Lossless */
  ATRAC_AL = "audio/atrac-al",
  /** FLAC in Matroska container */
  MKA_FLAC = "audio/x-matroska",
  /** HLS ALAC (Apple Lossless over HLS) */
  HLS_ALAC = "application/vnd.apple.mpegurl",
  /** HLS FLAC */
  HLS_FLAC = "application/vnd.apple.mpegurl",
  /** HLS PCM */
  HLS_PCM = "application/vnd.apple.mpegurl",
  /** DASH FLAC */
  DASH_FLAC = "application/dash+xml",
  /** DASH ALAC */
  DASH_ALAC = "application/dash+xml",
  /** AAC 320kbps (if available) */
  AAC_320 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** AAC 256kbps - Go+ Premium */
  AAC_256 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** MP3 320kbps - Highest MP3 */
  MP3_320 = "audio/mpeg",
  /** MP3 256kbps */
  MP3_256 = "audio/mpeg",
  /** Ogg Vorbis 500kbps */
  OGG_VORBIS_500 = "audio/ogg; codecs=\"vorbis\"",
  /** Ogg Vorbis 320kbps */
  OGG_VORBIS_320 = "audio/ogg; codecs=\"vorbis\"",
  /** Opus 256kbps */
  OPUS_256 = "audio/ogg; codecs=\"opus\"",
  /** HLS AAC 320kbps */
  HLS_AAC_320 = "application/vnd.apple.mpegurl",
  /** HLS AAC 256kbps - Go+ Premium streaming */
  HLS_AAC_256 = "application/vnd.apple.mpegurl",
  /** DASH AAC 320kbps */
  DASH_AAC_320 = "application/dash+xml",
  /** DASH AAC 256kbps */
  DASH_AAC_256 = "application/dash+xml",
  /** AAC 224kbps */
  AAC_224 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** AAC 192kbps */
  AAC_192 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** AAC 160kbps - Default SoundCloud HLS */
  AAC_160 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** MP3 224kbps */
  MP3_224 = "audio/mpeg",
  /** MP3 192kbps */
  MP3_192 = "audio/mpeg",
  /** MP3 160kbps */
  MP3_160 = "audio/mpeg",
  /** Ogg Vorbis 192kbps */
  OGG_VORBIS_192 = "audio/ogg; codecs=\"vorbis\"",
  /** Ogg Vorbis 160kbps */
  OGG_VORBIS_160 = "audio/ogg; codecs=\"vorbis\"",
  /** Opus 160kbps */
  OPUS_160 = "audio/ogg; codecs=\"opus\"",
  /** HLS AAC 192kbps */
  HLS_AAC_192 = "application/vnd.apple.mpegurl",
  /** HLS AAC 160kbps - SoundCloud default */
  HLS_AAC_160 = "application/vnd.apple.mpegurl",
  /** DASH AAC 192kbps */
  DASH_AAC_192 = "application/dash+xml",
  /** DASH AAC 160kbps */
  DASH_AAC_160 = "application/dash+xml",
  /** AAC 128kbps */
  AAC_128 = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** AAC 96kbps - HLS fallback */
  AAC_96 = "audio/mp4; codecs=\"mp4a.40.5\"",
  /** MP3 128kbps - Legacy free tier */
  MP3_128 = "audio/mpeg",
  /** MP3 112kbps */
  MP3_112 = "audio/mpeg",
  /** MP3 96kbps */
  MP3_96 = "audio/mpeg",
  /** Opus 128kbps */
  OPUS_128 = "audio/ogg; codecs=\"opus\"",
  /** Opus 96kbps */
  OPUS_96 = "audio/ogg; codecs=\"opus\"",
  /** Ogg Vorbis 128kbps */
  OGG_VORBIS_128 = "audio/ogg; codecs=\"vorbis\"",
  /** Ogg Vorbis 96kbps */
  OGG_VORBIS_96 = "audio/ogg; codecs=\"vorbis\"",
  /** HLS AAC 128kbps */
  HLS_AAC_128 = "application/vnd.apple.mpegurl",
  /** HLS AAC 96kbps - SoundCloud fallback */
  HLS_AAC_96 = "application/vnd.apple.mpegurl",
  /** DASH AAC 128kbps */
  DASH_AAC_128 = "application/dash+xml",
  /** DASH AAC 96kbps */
  DASH_AAC_96 = "application/dash+xml",
  /** AAC 64kbps - Low bandwidth */
  AAC_64 = "audio/mp4; codecs=\"mp4a.40.29\"",
  /** AAC 48kbps - Ultra low */
  AAC_48 = "audio/mp4; codecs=\"mp4a.40.29\"",
  /** AAC 32kbps - Minimum */
  AAC_32 = "audio/mp4; codecs=\"mp4a.40.29\"",
  /** MP3 64kbps */
  MP3_64 = "audio/mpeg",
  /** MP3 48kbps */
  MP3_48 = "audio/mpeg",
  /** MP3 32kbps */
  MP3_32 = "audio/mpeg",
  /** Opus 64kbps - Legacy low bandwidth */
  OPUS_64 = "audio/ogg; codecs=\"opus\"",
  /** Opus 48kbps */
  OPUS_48 = "audio/ogg; codecs=\"opus\"",
  /** Opus 32kbps */
  OPUS_32 = "audio/ogg; codecs=\"opus\"",
  /** HLS AAC 64kbps */
  HLS_AAC_64 = "application/vnd.apple.mpegurl",
  /** HLS AAC 48kbps */
  HLS_AAC_48 = "application/vnd.apple.mpegurl",
  /** DASH AAC 64kbps */
  DASH_AAC_64 = "application/dash+xml",
  /** DASH AAC 48kbps */
  DASH_AAC_48 = "application/dash+xml",
  /** MP3 Preview */
  MP3_PREVIEW = "audio/mpeg",
  /** AAC generic (default profile) */
  AAC = "audio/mp4; codecs=\"mp4a.40.2\"",
  /** AAC-LC (Low Complexity) */
  AAC_LC = "audio/aac",
  /** AAC-HE v1 (SBR) */
  AAC_HE = "audio/mp4; codecs=\"mp4a.40.5\"",
  /** AAC-HE v2 (SBR + PS) */
  AAC_HE_V2 = "audio/mp4; codecs=\"mp4a.40.29\"",
  /** xHE-AAC (Extended HE-AAC) */
  AAC_XHE = "audio/mp4; codecs=\"mp4a.40.42\"",
  /** MP3 generic */
  MP3 = "audio/mpeg",
  /** MP2 (MPEG Layer II) */
  MP2 = "audio/mpeg",
  /** MP1 (MPEG Layer I) */
  MP1 = "audio/mpeg",
  /** Opus generic */
  OPUS = "audio/ogg; codecs=\"opus\"",
  /** Opus in WebM container */
  WEBM_OPUS = "audio/webm; codecs=\"opus\"",
  /** Ogg Vorbis generic */
  OGG_VORBIS = "audio/ogg; codecs=\"vorbis\"",
  /** Ogg generic */
  OGG = "audio/ogg",
  /** M4A container */
  M4A = "audio/mp4",
  /** MP4 audio */
  MP4_AUDIO = "audio/mp4",
  /** Dolby Digital (AC-3) */
  AC3 = "audio/ac3",
  /** Dolby Digital Plus (E-AC-3) */
  EAC3 = "audio/eac3",
  /** Dolby Atmos */
  DOLBY_ATMOS = "audio/eac3-joc",
  /** DTS */
  DTS = "audio/vnd.dts",
  /** DTS-HD */
  DTS_HD = "audio/vnd.dts.hd",
  /** DTS:X */
  DTS_X = "audio/vnd.dts.uhd",
  /** AMR Narrowband */
  AMR_NB = "audio/amr",
  /** AMR Wideband */
  AMR_WB = "audio/amr-wb",
  /** AMR generic */
  AMR = "audio/amr",
  /** 3GPP audio */
  THREE_GPP = "audio/3gpp",
  /** 3GPP2 audio */
  THREE_GPP2 = "audio/3gpp2",
  /** GSM */
  GSM = "audio/gsm",
  /** G.711 μ-law */
  G711_ULAW = "audio/basic",
  /** G.711 A-law */
  G711_ALAW = "audio/x-alaw-basic",
  /** Windows Media Audio */
  WMA = "audio/x-ms-wma",
  /** WMA Pro */
  WMA_PRO = "audio/x-ms-wma",
  /** WMA Voice */
  WMA_VOICE = "audio/x-ms-wma",
  /** RealAudio */
  REAL_AUDIO = "audio/vnd.rn-realaudio",
  /** Apple CAF */
  CAF = "audio/x-caf",
  /** AU / SND (Sun/NeXT) */
  AU = "audio/basic",
  SND = "audio/basic",
  /** RAW PCM */
  PCM_RAW = "audio/L16",
  /** PCM signed 16-bit */
  PCM_S16LE = "audio/L16",
  /** PCM signed 24-bit */
  PCM_S24LE = "audio/L24",
  /** PCM float 32-bit */
  PCM_F32LE = "audio/L32",
  /** MIDI */
  MIDI = "audio/midi",
  /** MIDI Standard */
  MID = "audio/midi",
  /** Speex */
  SPEEX = "audio/ogg; codecs=\"speex\"",
  /** AC4 */
  AC4 = "audio/ac4",
  /** MPEG-H Audio */
  MPEGH = "audio/mhas",
  /** Sony ATRAC */
  ATRAC = "audio/atrac",
  /** ATRAC3 */
  ATRAC3 = "audio/atrac3",
  /** ATRAC3+ */
  ATRAC3_PLUS = "audio/atrac3plus",
  /** ATRAC9 */
  ATRAC9 = "audio/atrac9",
  /** XMA (Xbox Media Audio) */
  XMA = "audio/xma",
  /** XMA2 */
  XMA2 = "audio/xma2",
  /** BINK Audio */
  BINK = "audio/bink",
  /** Vorbis in Matroska */
  MKA_VORBIS = "audio/x-matroska",
  /** Generic Matroska Audio */
  MKA = "audio/x-matroska",
  /** AV1 Audio (experimental) */
  AV1_AUDIO = "audio/av1",
  /** USAC (Unified Speech and Audio Coding) */
  USAC = "audio/usac",
  /** EVS (Enhanced Voice Services) */
  EVS = "audio/evs",
  /** LC3 (Low Complexity Communication Codec) */
  LC3 = "audio/lc3",
  /** LC3plus */
  LC3_PLUS = "audio/lc3plus",
  /** Lyra (Google) */
  LYRA = "audio/lyra",
  /** Satin (Google) */
  SATIN = "audio/satin",
  /** Encodec (Meta) */
  ENCODEC = "audio/encodec",
  /** SoundStream */
  SOUNDSTREAM = "audio/soundstream",
  /** HLS Audio AAC */
  HLS_AAC = "application/vnd.apple.mpegurl",
  /** HLS Audio fMP4 */
  HLS_FMP4 = "application/vnd.apple.mpegurl",
  /** DASH Audio */
  DASH = "application/dash+xml",
  /** Smooth Streaming Audio */
  SMOOTH = "application/vnd.ms-sstr+xml",
  /** HLS Any - accept any HLS stream */
  HLS_ANY = "application/vnd.apple.mpegurl",
  /** DASH Any - accept any DASH stream */
  DASH_ANY = "application/dash+xml",
  /** Audio Any - accept any audio format */
  AUDIO_ANY = "audio/*"
}
//#endregion
//#region src/info.d.ts
/**
 * Represents an audio link to a Soundcloud Track
 */
interface Transcoding {
  url: string;
  preset: string;
  snipped: boolean;
  format: {
    protocol: STREAMING_PROTOCOLS;
    mime_type: FORMATS;
  };
}
//#endregion
//#region src/download-media.d.ts
declare const fromMedia: (media: Transcoding, clientID: string, axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>;
export = fromMedia;
//# sourceMappingURL=download-media.d.cts.map