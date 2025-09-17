/**
 * SoundCloud streaming protocols
 */
export enum STREAMING_PROTOCOLS {
  HLS = 'hls',
  PROGRESSIVE = 'progressive'
}

/**
 * @deprecated Use STREAMING_PROTOCOLS enum directly
 */
export const _PROTOCOLS = {
  HLS: STREAMING_PROTOCOLS.HLS,
  PROGRESSIVE: STREAMING_PROTOCOLS.PROGRESSIVE,
} as const

export default STREAMING_PROTOCOLS
