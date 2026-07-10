import { AxiosInstance } from "axios";
import m3u8stream from "m3u8stream";
//#region src/download-url.d.ts
declare const fromURL: (url: string, clientID: string, axiosInstance: AxiosInstance, options?: {
  apiTimeout?: number;
  streamTimeout?: number;
}) => Promise<any | m3u8stream.Stream>;
export = fromURL;
//# sourceMappingURL=download-url.d.cts.map