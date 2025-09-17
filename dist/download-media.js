"use strict";
/** @internal @packageDocumentation */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const m3u8stream_1 = __importDefault(require("m3u8stream"));
const protocols_1 = __importDefault(require("./protocols"));
const util_1 = require("./util");
const validatemedia = (media) => {
    if (!media.url || !media.format)
        return false;
    return true;
};
const fromMedia = async (media, clientID, axiosInstance) => {
    if (!validatemedia(media))
        throw new Error('Invalid media object provided');
    try {
        const link = (0, util_1.appendURL)(media.url, 'client_id', clientID);
        const res = await axiosInstance.get(link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            withCredentials: true
        });
        if (!res.data.url)
            throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${link}`);
        if (media.format.protocol === protocols_1.default.PROGRESSIVE) {
            const r = await axiosInstance.get(res.data.url, {
                withCredentials: true,
                responseType: 'stream'
            });
            return r.data;
        }
        return (0, m3u8stream_1.default)(res.data.url);
    }
    catch (err) {
        throw (0, util_1.handleRequestErrs)(err);
    }
};
exports.default = fromMedia;
//# sourceMappingURL=download-media.js.map