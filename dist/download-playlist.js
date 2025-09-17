"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPlaylist = void 0;
const download_1 = require("./download");
const info_1 = require("./info");
const downloadPlaylist = async (url, clientID, axiosInstance) => {
    const info = await (0, info_1.getSetInfo)(url, clientID, axiosInstance);
    const trackNames = [];
    const result = await Promise.all(info.tracks.map(track => {
        const p = (0, download_1.download)(track.permalink_url, clientID, axiosInstance);
        trackNames.push(track.title);
        return p;
    }));
    return [result, trackNames];
};
exports.downloadPlaylist = downloadPlaylist;
//# sourceMappingURL=download-playlist.js.map