"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.SCDL = void 0;
const soundcloud_key_fetch_1 = __importDefault(require("soundcloud-key-fetch"));
const info_1 = __importStar(require("./info"));
const filter_media_1 = __importDefault(require("./filter-media"));
const download_1 = require("./download");
const url_1 = __importStar(require("./url"));
const protocols_1 = require("./protocols");
const formats_1 = require("./formats");
const search_1 = require("./search");
const download_playlist_1 = require("./download-playlist");
const axios_1 = __importDefault(require("axios"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const likes_1 = require("./likes");
const user_1 = require("./user");
/** @internal */
const downloadFormat = async (url, clientID, format, axiosInstance) => {
    const info = await (0, info_1.default)(url, clientID, axiosInstance);
    const filtered = (0, filter_media_1.default)(info.media.transcodings, { format: format });
    if (filtered.length === 0)
        throw new Error(`Could not find media with specified format: (${format})`);
    return await (0, download_1.fromMediaObj)(filtered[0], clientID, axiosInstance);
};
class SCDL {
    STREAMING_PROTOCOLS;
    FORMATS;
    _clientID;
    _filePath;
    axios;
    saveClientID = process.env.SAVE_CLIENT_ID ? process.env.SAVE_CLIENT_ID.toLowerCase() === 'true' : false;
    stripMobilePrefix;
    convertFirebaseLinks;
    constructor(options) {
        if (!options)
            options = {};
        if (options.saveClientID) {
            this.saveClientID = options.saveClientID;
            if (options.filePath)
                this._filePath = options.filePath;
        }
        else {
            if (options.clientID) {
                this._clientID = options.clientID;
            }
        }
        if (options.axiosInstance) {
            this.setAxiosInstance(options.axiosInstance);
        }
        else {
            this.setAxiosInstance(axios_1.default);
        }
        if (!options.stripMobilePrefix)
            options.stripMobilePrefix = true;
        if (!options.convertFirebaseLinks)
            options.convertFirebaseLinks = true;
        this.stripMobilePrefix = options.stripMobilePrefix;
        this.convertFirebaseLinks = options.convertFirebaseLinks;
    }
    /**
     * Returns a media Transcoding that matches the given predicate object
     * @param media - The Transcodings to filter
     * @param predicateObj - The desired Transcoding object to match
     * @returns An array of Transcodings that match the predicate object
     */
    filterMedia(media, predicateObj) {
        return (0, filter_media_1.default)(media, predicateObj);
    }
    /**
     * Get the audio of a given track. It returns the first format found.
     *
     * @param url - The URL of the Soundcloud track
     * @param useDirectLink - Whether or not to use the download link if the artist has set the track to be downloadable. This has erratic behaviour on some environments.
     * @returns A ReadableStream containing the audio data
    */
    async download(url, useDirectLink = true) {
        // POBIERZ INFO O TRACKU
        const info = await this.getInfo(url);
        // ODRZUĆ SAMPLE ~30s (+/- 0.6s) I OGRANICZENIA REGIONALNE
        if (typeof info.duration === 'number' &&
            info.duration >= 29500 &&
            info.duration <= 30500) {
            throw new Error('Ten utwór to najprawdopodobniej 30-sekundowy sample/prewka SoundCloud!');
        }
        if ('region_restricted' in info && info.region_restricted === true) {
            throw new Error('Ten utwór jest niedostępny w Twoim regionie!');
        }
        if (info.streamable !== true) {
            throw new Error('Nie można streamować tego utworu!');
        }
        // Jeśli przeszedł checki, pobieraj!
        return (0, download_1.download)(await this.prepareURL(url), await this.getClientID(), this.axios, useDirectLink);
    }
    /**
     *  Get the audio of a given track with the specified format
     * @param url - The URL of the Soundcloud track
     * @param format - The desired format
    */
    async downloadFormat(url, format) {
        return downloadFormat(await this.prepareURL(url), await this.getClientID(), format, this.axios);
    }
    /**
     * Returns info about a given track.
     * @param url - URL of the Soundcloud track
     * @returns Info about the track
    */
    async getInfo(url) {
        return (0, info_1.default)(await this.prepareURL(url), await this.getClientID(), this.axios);
    }
    /**
     * Returns info about the given track(s) specified by ID.
     * @param ids - The ID(s) of the tracks
     * @returns Info about the track
     */
    async getTrackInfoByID(ids, playlistID, playlistSecretToken) {
        return (0, info_1.getTrackInfoByID)(await this.getClientID(), this.axios, ids, playlistID, playlistSecretToken);
    }
    /**
     * Returns info about the given set
     * @param url - URL of the Soundcloud set
     * @returns Info about the set
     */
    async getSetInfo(url) {
        return (0, info_1.getSetInfo)(await this.prepareURL(url), await this.getClientID(), this.axios);
    }
    /**
     * Searches for tracks/playlists for the given query
     * @param options - The search option
     * @returns SearchResponse
     */
    async search(options) {
        return (0, search_1.search)(options, this.axios, await this.getClientID());
    }
    /**
     * Finds related tracks to the given track specified by ID
     * @param id - The ID of the track
     * @param limit - The number of results to return
     * @param offset - Used for pagination, set to 0 if you will not use this feature.
     */
    async related(id, limit, offset = 0) {
        return (0, search_1.related)(id, limit, offset, this.axios, await this.getClientID());
    }
    /**
     * Returns the audio streams and titles of the tracks in the given playlist.
     * @param url - The url of the playlist
     */
    async downloadPlaylist(url) {
        return (0, download_playlist_1.downloadPlaylist)(await this.prepareURL(url), await this.getClientID(), this.axios);
    }
    /**
     * Returns track information for a user's likes
     * @param options - Can either be the profile URL of the user, or their ID
     * @returns - An array of tracks
     */
    async getLikes(options) {
        let id;
        const clientID = await this.getClientID();
        if (options.id) {
            id = options.id;
        }
        else if (options.profileUrl) {
            const user = await (0, user_1.getUser)(await this.prepareURL(options.profileUrl), clientID, this.axios);
            id = user.id;
        }
        else if (options.nextHref) {
            return await (0, likes_1.getLikes)(options, clientID, this.axios);
        }
        else {
            throw new Error('options.id or options.profileURL must be provided.');
        }
        options.id = id;
        return (0, likes_1.getLikes)(options, clientID, this.axios);
    }
    /**
     * Returns information about a user
     * @param url - The profile URL of the user
     */
    async getUser(url) {
        return (0, user_1.getUser)(await this.prepareURL(url), await this.getClientID(), this.axios);
    }
    /**
     * Sets the instance of Axios to use to make requests to SoundCloud API
     * @param instance - An instance of Axios
     */
    setAxiosInstance(instance) {
        this.axios = instance;
    }
    /**
     * Returns whether or not the given URL is a valid Soundcloud URL
     * @param url - URL of the Soundcloud track
    */
    isValidUrl(url) {
        return (0, url_1.default)(url, this.convertFirebaseLinks, this.stripMobilePrefix);
    }
    /**
     * Returns whether or not the given URL is a valid playlist SoundCloud URL
     * @param url - The URL to check
     */
    isPlaylistURL(url) {
        return (0, url_1.isPlaylistURL)(url);
    }
    /**
     * Returns true if the given URL is a personalized track URL. (of the form https://soundcloud.com/discover/sets/personalized-tracks::user-sdlkfjsldfljs:847104873)
     * @param url - The URL to check
     */
    isPersonalizedTrackURL(url) {
        return (0, url_1.isPersonalizedTrackURL)(url);
    }
    /**
     * Returns true if the given URL is a Firebase URL (of the form https://soundcloud.app.goo.gl/XXXXXXXX)
     * @param url - The URL to check
     */
    isFirebaseURL(url) {
        return (0, url_1.isFirebaseURL)(url);
    }
    async getClientID() {
        if (!this._clientID) {
            await this.setClientID();
        }
        return this._clientID;
    }
    /** @internal */
    async setClientID(clientID) {
        if (!clientID) {
            if (!this._clientID) {
                if (this.saveClientID) {
                    const filename = path.resolve(__dirname, this._filePath ? this._filePath : '../client_id.json');
                    const c = await this._getClientIDFromFile(filename);
                    if (!c) {
                        this._clientID = await soundcloud_key_fetch_1.default.fetchKey();
                        const data = {
                            clientID: this._clientID,
                            date: new Date().toISOString()
                        };
                        fs.writeFile(filename, JSON.stringify(data), {}, err => {
                            if (err)
                                console.log('Failed to save client_id to file: ' + err);
                        });
                    }
                    else {
                        this._clientID = c;
                    }
                }
                else {
                    this._clientID = await soundcloud_key_fetch_1.default.fetchKey();
                }
            }
            return this._clientID;
        }
        this._clientID = clientID;
        return clientID;
    }
    /** @internal */
    async _getClientIDFromFile(filename) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(filename))
                return resolve('');
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err)
                    return reject(err);
                let c;
                try {
                    c = JSON.parse(data);
                }
                catch (err) {
                    return reject(err);
                }
                if (!c.date && !c.clientID)
                    return reject(new Error("Property 'data' or 'clientID' missing from client_id.json"));
                if (typeof c.clientID !== 'string')
                    return reject(new Error("Property 'clientID' is not a string in client_id.json"));
                if (typeof c.date !== 'string')
                    return reject(new Error("Property 'date' is not a string in client_id.json"));
                const d = new Date(c.date);
                if (Number.isNaN(d.getDay()))
                    return reject(new Error("Invalid date object from 'date' in client_id.json"));
                const dayMs = 60 * 60 * 24 * 1000;
                if (new Date().getTime() - d.getTime() >= dayMs) {
                    // Older than a day, delete
                    fs.unlink(filename, err => {
                        if (err)
                            console.log('Failed to delete client_id.json: ' + err);
                    });
                    return resolve('');
                }
                else {
                    return resolve(c.clientID);
                }
            });
        });
    }
    /**
     * Prepares the given URL by stripping its mobile prefix (if this.stripMobilePrefix is true)
     * and converting it to a regular URL (if this.convertFireBaseLinks is true.)
     * @param url
     */
    async prepareURL(url) {
        if (this.stripMobilePrefix)
            url = (0, url_1.stripMobilePrefix)(url);
        if (this.convertFirebaseLinks) {
            if ((0, url_1.isFirebaseURL)(url))
                url = await (0, url_1.convertFirebaseURL)(url, this.axios);
        }
        return url;
    }
}
exports.SCDL = SCDL;
// SCDL instance with default configutarion
const scdl = new SCDL();
// Creates an instance of SCDL with custom configuration
const create = (options) => new SCDL(options);
exports.create = create;
scdl.STREAMING_PROTOCOLS = protocols_1._PROTOCOLS;
scdl.FORMATS = formats_1._FORMATS;
exports.default = scdl;
//# sourceMappingURL=index.js.map