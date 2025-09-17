/** @internal @packageDocumentation */
import m3u8stream from 'm3u8stream';
import { Transcoding } from './info';
import { AxiosInstance } from 'axios';
declare const fromMedia: (media: Transcoding, clientID: string, axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>;
export default fromMedia;
