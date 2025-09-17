"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLikes = void 0;
const util_1 = require("./util");
const baseURL = 'https://api-v2.soundcloud.com/users/';
/** @internal */
const getLikes = async (options, clientID, axiosInstance) => {
    let u = '';
    if (!options.nextHref) {
        if (!options.limit)
            options.limit = -1;
        if (!options.offset)
            options.offset = 0;
        u = (0, util_1.appendURL)(`https://api-v2.soundcloud.com/users/${options.id}/likes`, 'client_id', clientID, 'limit', '' + (options.limit === -1 ? 200 : options.limit), 'offset', '' + options.offset);
    }
    else {
        u = (0, util_1.appendURL)(options.nextHref, 'client_id', clientID);
    }
    let response;
    let nextHref = 'start';
    // If options.limit > 0, query each page of likes until we have collected
    // `options.limit` liked tracks.
    // If options.limit === -1, query every page of likes
    while (nextHref && (options.limit > 0 || options.limit === -1)) {
        const { data } = await axiosInstance.get(u);
        const query = data;
        if (!query.collection)
            throw new Error('Invalid JSON response received');
        if (query.collection.length === 0)
            return data;
        if (query.collection[0].kind !== 'like')
            throw (0, util_1.kindMismatchError)('like', query.collection[0].kind);
        // Only add tracks (for now)
        query.collection = query.collection.reduce((prev, curr) => curr.track ? prev.concat(curr) : prev, []);
        if (!response) {
            response = query;
        }
        else {
            response.collection.push(...query.collection);
        }
        if (options.limit !== -1) {
            options.limit -= query.collection.length;
            // We have collected enough likes
            if (options.limit <= 0)
                break;
        }
        nextHref = query.next_href;
        if (nextHref) {
            if (options.limit !== -1) {
                const url = new URL(nextHref);
                url.searchParams.set('limit', '' + options.limit);
                nextHref = url.toString();
            }
            u = (0, util_1.appendURL)(nextHref, 'client_id', clientID);
        }
    }
    return response;
};
exports.getLikes = getLikes;
//# sourceMappingURL=likes.js.map