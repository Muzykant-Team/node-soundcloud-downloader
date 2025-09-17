"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrackInfoByID = exports.getSetInfo = exports.getInfoBase = void 0;
const util_1 = require("./util");
const getTrackInfoBase = async (clientID, axiosRef, ids, playlistID, playlistSecretToken) => {
    let url = (0, util_1.appendURL)('https://api-v2.soundcloud.com/tracks', 'ids', ids.join(','), 'client_id', clientID);
    if (playlistID && playlistSecretToken) {
        url = (0, util_1.appendURL)(url, 'playlistId', '' + playlistID, 'playlistSecretToken', playlistSecretToken);
    }
    try {
        const { data } = await axiosRef.get(url);
        return data;
    }
    catch (err) {
        throw (0, util_1.handleRequestErrs)(err);
    }
};
/** @internal */
const getInfoBase = async (url, clientID, axiosRef) => {
    try {
        const res = await axiosRef.get((0, util_1.appendURL)('https://api-v2.soundcloud.com/resolve', 'url', url, 'client_id', clientID), {
            withCredentials: true
        });
        return res.data;
    }
    catch (err) {
        throw (0, util_1.handleRequestErrs)(err);
    }
};
exports.getInfoBase = getInfoBase;
/** @internal */
const getSetInfoBase = async (url, clientID, axiosRef) => {
    const setInfo = await (0, exports.getInfoBase)(url, clientID, axiosRef);
    const temp = [...setInfo.tracks].map(track => track.id);
    const playlistID = setInfo.id;
    const playlistSecretToken = setInfo.secret_token;
    const incompleteTracks = setInfo.tracks.filter(track => !track.title);
    if (incompleteTracks.length === 0) {
        return setInfo;
    }
    const completeTracks = setInfo.tracks.filter(track => track.title);
    const ids = incompleteTracks.map(t => t.id);
    if (ids.length > 50) {
        const splitIds = [];
        for (let x = 0; x <= Math.floor(ids.length / 50); x++) {
            splitIds.push([]);
        }
        for (let x = 0; x < ids.length; x++) {
            const i = Math.floor(x / 50);
            splitIds[i].push(ids[x]);
        }
        const promises = splitIds.map(async (ids) => await (0, exports.getTrackInfoByID)(clientID, axiosRef, ids, playlistID, playlistSecretToken));
        const info = await Promise.all(promises);
        setInfo.tracks = completeTracks.concat(...info);
        setInfo.tracks = sortTracks(setInfo.tracks, temp);
        return setInfo;
    }
    const info = await (0, exports.getTrackInfoByID)(clientID, axiosRef, ids, playlistID, playlistSecretToken);
    setInfo.tracks = completeTracks.concat(info);
    setInfo.tracks = sortTracks(setInfo.tracks, temp);
    return setInfo;
};
/** @internal */
const sortTracks = (tracks, ids) => {
    for (let i = 0; i < ids.length; i++) {
        if (tracks[i].id !== ids[i]) {
            for (let j = 0; j < tracks.length; j++) {
                if (tracks[j].id === ids[i]) {
                    const temp = tracks[i];
                    tracks[i] = tracks[j];
                    tracks[j] = temp;
                }
            }
        }
    }
    return tracks;
};
/** @internal */
const getInfo = async (url, clientID, axiosInstance) => {
    let data;
    if (url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')) {
        const idString = (0, util_1.extractIDFromPersonalizedTrackURL)(url);
        if (!idString)
            throw new Error('Could not parse track ID from given URL: ' + url);
        let id;
        try {
            id = parseInt(idString);
        }
        catch (err) {
            throw new Error('Could not parse track ID from given URL: ' + url);
        }
        data = (await (0, exports.getTrackInfoByID)(clientID, axiosInstance, [id]))[0];
        if (!data)
            throw new Error('Could not find track with ID: ' + id);
    }
    else {
        data = await (0, exports.getInfoBase)(url, clientID, axiosInstance);
    }
    if (!data.media)
        throw new Error('The given URL does not link to a Soundcloud track');
    return data;
};
/** @internal */
const getSetInfo = async (url, clientID, axiosInstance) => {
    const data = await getSetInfoBase(url, clientID, axiosInstance);
    if (!data.tracks)
        throw new Error('The given URL does not link to a Soundcloud set');
    return data;
};
exports.getSetInfo = getSetInfo;
/** @intenral */
const getTrackInfoByID = async (clientID, axiosInstance, ids, playlistID, playlistSecretToken) => {
    return await getTrackInfoBase(clientID, axiosInstance, ids, playlistID, playlistSecretToken);
};
exports.getTrackInfoByID = getTrackInfoByID;
exports.default = getInfo;
//# sourceMappingURL=info.js.map