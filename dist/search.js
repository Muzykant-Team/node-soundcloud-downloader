"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.related = exports.search = void 0;
const util_1 = require("./util");
const baseURL = 'https://api-v2.soundcloud.com/search';
const validResourceTypes = ['tracks', 'users', 'albums', 'playlists', 'all'];
/** @internal */
const search = async (options, axiosInstance, clientID) => {
    let url = '';
    if (!options.limit)
        options.limit = 10;
    if (!options.offset)
        options.offset = 0;
    if (!options.resourceType)
        options.resourceType = 'tracks';
    if (options.nextHref) {
        url = (0, util_1.appendURL)(options.nextHref, 'client_id', clientID);
    }
    else if (options.query) {
        if (!validResourceTypes.includes(options.resourceType)) {
            throw new Error(`${options.resourceType} is not one of ${validResourceTypes
                .map(str => `'${str}'`)
                .join(', ')}`);
        }
        url = (0, util_1.appendURL)(`${baseURL}${options.resourceType === 'all' ? '' : `/${options.resourceType}`}`, 'client_id', clientID, 'q', options.query, 'limit', '' + options.limit, 'offset', '' + options.offset);
    }
    else {
        throw new Error('One of options.query or options.nextHref is required');
    }
    const { data } = await axiosInstance.get(url);
    // Zmieniono: odrzucaj utwory z czasem trwania ~30s (np. 29500-30500 ms), nie tylko 30000
    if (options.resourceType === 'tracks' && Array.isArray(data.collection)) {
        data.collection = data.collection.filter((track) => {
            // Odrzucaj sample o długości w pobliżu 30s (29.5–30.5 sekundy)
            if (typeof track.duration === 'number' &&
                track.duration >= 29500 &&
                track.duration <= 30500)
                return false;
            if ('region_restricted' in track && track.region_restricted === true)
                return false;
            if (track.streamable !== true)
                return false;
            return true;
        });
    }
    return data;
};
exports.search = search;
/** @internal */
const related = async (id, limit = 10, offset = 0, axiosInstance, clientID) => {
    const { data } = await axiosInstance.get((0, util_1.appendURL)(`https://api-v2.soundcloud.com/tracks/${id}/related`, 'client_id', clientID, 'offset', '' + offset, 'limit', '' + limit));
    return data;
};
exports.related = related;
//# sourceMappingURL=search.js.map