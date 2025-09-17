"use strict";
/** @internal @packageDocumentation */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const m3u8stream_1 = __importDefault(require("m3u8stream"));
const util_1 = require("./util");
const fromURL = async (url, clientID, axiosInstance) => {
    try {
        const link = (0, util_1.appendURL)(url, 'client_id', clientID);
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
        if (url.includes('/progressive')) {
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
exports.default = fromURL;
//# sourceMappingURL=download-url.js.map