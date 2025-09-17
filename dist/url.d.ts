import { AxiosInstance } from 'axios';
declare const isURL: (url: string, testMobile?: boolean, testFirebase?: boolean) => boolean;
export declare const isPlaylistURL: (url: string) => boolean;
export declare const isPersonalizedTrackURL: (url: string) => boolean;
export declare const stripMobilePrefix: (url: string) => string;
export declare const isFirebaseURL: (url: string) => boolean;
export declare const convertFirebaseURL: (url: string, axiosInstance: AxiosInstance) => Promise<string>;
export default isURL;
