/** @internal @packageDocumentation */
import { AxiosInstance } from 'axios';
import m3u8stream from 'm3u8stream';
import { Transcoding } from './info';
export declare const getMediaURL: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>;
export declare const getProgressiveStream: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>;
export declare const getHLSStream: (mediaUrl: string) => m3u8stream.Stream;
type fromURLFunctionBase = (url: string, clientID: string, getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>, getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>, getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream, axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>;
export declare const fromURLBase: fromURLFunctionBase;
export declare const fromURL: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>;
export declare const fromMediaObjBase: (media: Transcoding, clientID: string, getMediaURLFunction: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<string>, getProgressiveStreamFunction: (mediaUrl: string, axiosInstance: AxiosInstance) => Promise<any>, getHLSStreamFunction: (mediaUrl: string) => m3u8stream.Stream, fromURLFunction: typeof fromURL, axiosInstance: AxiosInstance) => Promise<any | m3u8stream.Stream>;
export declare const fromMediaObj: (media: Transcoding, clientID: string, axiosInstance: AxiosInstance) => Promise<any>;
export declare const fromDownloadLink: (id: number, clientID: string, axiosInstance: AxiosInstance) => Promise<any>;
/** @internal */
export declare const download: (url: string, clientID: string, axiosInstance: AxiosInstance, useDownloadLink?: boolean) => Promise<any>;
export {};
