//#region src/protocols.d.ts
/**
 * Soundcloud streams tracks using these protocols.
 */
declare enum STREAMING_PROTOCOLS {
  HLS = "hls",
  PROGRESSIVE = "progressive"
}
/** @internal */
declare const _PROTOCOLS: {
  HLS: STREAMING_PROTOCOLS;
  PROGRESSIVE: STREAMING_PROTOCOLS;
};
//#endregion
export { _PROTOCOLS, STREAMING_PROTOCOLS as default };
//# sourceMappingURL=protocols.d.mts.map