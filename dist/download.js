"use strict";
/** @internal @packageDocumentation */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.fromDownloadLink = exports.fromMediaObj = exports.fromMediaObjBase = exports.fromURL = exports.fromURLBase = exports.getHLSStream = exports.getProgressiveStream = exports.getMediaURL = void 0;
const m3u8stream_1 = __importDefault(require("m3u8stream"));
const util_1 = require("./util");
const info_1 = __importDefault(require("./info"));
const getMediaURL = async (url, clientID, axiosInstance) => {
    const res = await axiosInstance.get((0, util_1.appendURL)(url, 'client_id', clientID), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
            Accept: '*/*',
            'Accept-Encoding': 'gzip, deflate, br'
        },
        withCredentials: true
    });
    if (!res.data.url)
        throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${url}`);
    return res.data.url;
};
exports.getMediaURL = getMediaURL;
const getProgressiveStream = async (mediaUrl, axiosInstance) => {
    const r = await axiosInstance.get(mediaUrl, {
        withCredentials: true,
        responseType: 'stream'
    });
    return r.data;
};
exports.getProgressiveStream = getProgressiveStream;
const getHLSStream = (mediaUrl) => (0, m3u8stream_1.default)(mediaUrl);
exports.getHLSStream = getHLSStream;
const fromURLBase = async (url, clientID, getMediaURLFunction, getProgressiveStreamFunction, getHLSStreamFunction, axiosInstance) => {
    try {
        const mediaUrl = await getMediaURLFunction(url, clientID, axiosInstance);
        if (url.includes('/progressive')) {
            return await getProgressiveStreamFunction(mediaUrl, axiosInstance);
        }
        return getHLSStreamFunction(mediaUrl);
    }
    catch (err) {
        throw (0, util_1.handleRequestErrs)(err);
    }
};
exports.fromURLBase = fromURLBase;
const fromURL = async (url, clientID, axiosInstance) => await (0, exports.fromURLBase)(url, clientID, exports.getMediaURL, exports.getProgressiveStream, exports.getHLSStream, axiosInstance);
exports.fromURL = fromURL;
const fromMediaObjBase = async (media, clientID, getMediaURLFunction, getProgressiveStreamFunction, getHLSStreamFunction, fromURLFunction, axiosInstance) => {
    if (!validatemedia(media))
        throw new Error('Invalid media object provided');
    return await fromURLFunction(media.url, clientID, axiosInstance);
};
exports.fromMediaObjBase = fromMediaObjBase;
const fromMediaObj = async (media, clientID, axiosInstance) => await (0, exports.fromMediaObjBase)(media, clientID, exports.getMediaURL, exports.getProgressiveStream, exports.getHLSStream, exports.fromURL, axiosInstance);
exports.fromMediaObj = fromMediaObj;
const fromDownloadLink = async (id, clientID, axiosInstance) => {
    const { data: { redirectUri } } = await axiosInstance.get((0, util_1.appendURL)(`https://api-v2.soundcloud.com/tracks/${id}/download`, 'client_id', clientID));
    const { data } = await axiosInstance.get(redirectUri, {
        responseType: 'stream'
    });
    return data;
};
exports.fromDownloadLink = fromDownloadLink;
/** @internal */
const download = async (url, clientID, axiosInstance, useDownloadLink = true) => {
    const info = await (0, info_1.default)(url, clientID, axiosInstance);
    if (info.downloadable && useDownloadLink) {
        // Some tracks have `downloadable` set to true but will return a 404
        // when using download API route.
        try {
            return await (0, exports.fromDownloadLink)(info.id, clientID, axiosInstance);
        }
        catch (err) {
        }
    }
    return await (0, exports.fromMediaObj)(info.media.transcodings[0], clientID, axiosInstance);
};
exports.download = download;
const validatemedia = (media) => {
    if (!media.url || !media.format)
        return false;
    return true;
};
//# sourceMappingURL=download.js.map