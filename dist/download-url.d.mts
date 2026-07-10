import m3u8stream from "m3u8stream";
import { AxiosInstance } from "axios";
//#region src/download-url.d.ts
declare const fromURL: (url: string, clientID: string, axiosInstance: AxiosInstance, options?: {
  apiTimeout?: number;
  streamTimeout?: number;
}) => Promise<any | m3u8stream.Stream>;
//#endregion
export { fromURL as default };
//# sourceMappingURL=download-url.d.mts.map