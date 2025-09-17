"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertFirebaseURL = exports.isFirebaseURL = exports.stripMobilePrefix = exports.isPersonalizedTrackURL = exports.isPlaylistURL = void 0;
/** @internal @packageDocumentation */
const regexp = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
const mobileUrlRegex = /^https?:\/\/(m\.soundcloud\.com)\/(.*)$/;
const firebaseUrlRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
const firebaseRegexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,500}\.[a-zA-Z0-9()]{1,500}\b([-a-zA-Z0-9()@:%_+.~#?&//\\=]*)/g;
const isURL = (url, testMobile, testFirebase) => {
    let success = false;
    if (testMobile) {
        if (url.match(mobileUrlRegex))
            success = !!url.match(regexp)[2];
    }
    if (!success && testFirebase) {
        if (url.match(firebaseRegexp))
            success = !!url.match(firebaseRegexp)[2];
    }
    if (!success && url.match(regexp))
        success = !!url.match(regexp)[2];
    return success;
};
const isPlaylistURL = (url) => {
    if (!isURL(url))
        return false;
    try {
        const u = new URL(url);
        return u.pathname.includes('/sets/');
    }
    catch (err) {
        return false;
    }
};
exports.isPlaylistURL = isPlaylistURL;
const isPersonalizedTrackURL = (url) => {
    if (!isURL(url))
        return false;
    return url.includes('https://soundcloud.com/discover/sets/personalized-tracks::');
};
exports.isPersonalizedTrackURL = isPersonalizedTrackURL;
const stripMobilePrefix = (url) => {
    try {
        const _url = new URL(url);
        if (_url.hostname !== 'm.soundcloud.com')
            return url;
        _url.hostname = 'soundcloud.com';
        return _url.toString();
    }
    catch (e) {
        return url;
    }
};
exports.stripMobilePrefix = stripMobilePrefix;
const isFirebaseURL = (url) => {
    try {
        return new URL(url).hostname === 'soundcloud.app.goo.gl';
    }
    catch {
        return false;
    }
};
exports.isFirebaseURL = isFirebaseURL;
const convertFirebaseURL = async (url, axiosInstance) => {
    const _url = new URL(url);
    _url.searchParams.set('d', '1');
    const { data } = await axiosInstance.get(_url.toString());
    const matches = data.match(firebaseRegexp);
    if (!matches)
        throw new Error(`Could not find URL for this SoundCloud Firebase URL: ${url}`);
    const firebaseURL = matches.find(match => regexp.test(match));
    if (!firebaseURL)
        return undefined;
    // Some of the characters are in their unicode character code form (e.g. \u003d),
    // use regex to find occurences of \uXXXX, parse their hexidecimal unicode value and convert to regular char
    return firebaseURL.replace(/\\u([\d\w]{4})/gi, (_match, grp) => String.fromCharCode(parseInt(grp, 16)));
};
exports.convertFirebaseURL = convertFirebaseURL;
exports.default = isURL;
//# sourceMappingURL=url.js.map