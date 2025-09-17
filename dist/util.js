"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kindMismatchError = exports.extractIDFromPersonalizedTrackURL = exports.appendURL = exports.handleRequestErrs = exports.resolveURL = void 0;
/** @internal @packageDocumentation */
const url_1 = require("url");
exports.resolveURL = 'https://api-v2.soundcloud.com/resolve';
const handleRequestErrs = (err) => {
    if (!err.response)
        return err;
    if (!err.response.status)
        return err;
    if (err.response.status === 401)
        err.message += ', is your Client ID correct?';
    if (err.response.status === 404)
        err.message += ', could not find the song... it may be private - check the URL';
    return err;
};
exports.handleRequestErrs = handleRequestErrs;
const appendURL = (url, ...params) => {
    const u = new url_1.URL(url);
    params.forEach((val, idx) => {
        if (idx % 2 === 0)
            u.searchParams.append(val, params[idx + 1]);
    });
    return u.href;
};
exports.appendURL = appendURL;
const extractIDFromPersonalizedTrackURL = (url) => {
    if (!url.includes('https://soundcloud.com/discover/sets/personalized-tracks::'))
        return '';
    const split = url.split(':');
    if (split.length < 5)
        return '';
    return split[4];
};
exports.extractIDFromPersonalizedTrackURL = extractIDFromPersonalizedTrackURL;
const kindMismatchError = (expected, received) => new Error(`Expected resouce of kind: (${expected}), received: (${received})`);
exports.kindMismatchError = kindMismatchError;
//# sourceMappingURL=util.js.map