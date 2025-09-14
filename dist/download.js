"use strict";
/** @internal @packageDocumentation */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.fromDownloadLink = exports.fromMediaObj = exports.fromMediaObjBase = exports.fromURL = exports.fromURLBase = exports.getHLSStream = exports.getProgressiveStream = exports.getMediaURL = void 0;
var m3u8stream_1 = __importDefault(require("m3u8stream"));
var util_1 = require("./util");
var info_1 = __importDefault(require("./info"));
var getMediaURL = function (url, clientID, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axiosInstance.get((0, util_1.appendURL)(url, 'client_id', clientID), {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.7339.52 Safari/537.36',
                        Accept: '*/*',
                        'Accept-Encoding': 'gzip, deflate, br'
                    },
                    withCredentials: true
                })];
            case 1:
                res = _a.sent();
                if (!res.data.url)
                    throw new Error("Invalid response from Soundcloud. Check if the URL provided is correct: ".concat(url));
                return [2 /*return*/, res.data.url];
        }
    });
}); };
exports.getMediaURL = getMediaURL;
var getProgressiveStream = function (mediaUrl, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () {
    var r;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axiosInstance.get(mediaUrl, {
                    withCredentials: true,
                    responseType: 'stream'
                })];
            case 1:
                r = _a.sent();
                return [2 /*return*/, r.data];
        }
    });
}); };
exports.getProgressiveStream = getProgressiveStream;
var getHLSStream = function (mediaUrl) { return (0, m3u8stream_1.default)(mediaUrl); };
exports.getHLSStream = getHLSStream;
var fromURLBase = function (url, clientID, getMediaURLFunction, getProgressiveStreamFunction, getHLSStreamFunction, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () {
    var mediaUrl, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, getMediaURLFunction(url, clientID, axiosInstance)];
            case 1:
                mediaUrl = _a.sent();
                if (!url.includes('/progressive')) return [3 /*break*/, 3];
                return [4 /*yield*/, getProgressiveStreamFunction(mediaUrl, axiosInstance)];
            case 2: return [2 /*return*/, _a.sent()];
            case 3: return [2 /*return*/, getHLSStreamFunction(mediaUrl)];
            case 4:
                err_1 = _a.sent();
                throw (0, util_1.handleRequestErrs)(err_1);
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.fromURLBase = fromURLBase;
var fromURL = function (url, clientID, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, (0, exports.fromURLBase)(url, clientID, exports.getMediaURL, exports.getProgressiveStream, exports.getHLSStream, axiosInstance)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.fromURL = fromURL;
var fromMediaObjBase = function (media, clientID, getMediaURLFunction, getProgressiveStreamFunction, getHLSStreamFunction, fromURLFunction, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!validatemedia(media))
                    throw new Error('Invalid media object provided');
                return [4 /*yield*/, fromURLFunction(media.url, clientID, axiosInstance)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.fromMediaObjBase = fromMediaObjBase;
var fromMediaObj = function (media, clientID, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, (0, exports.fromMediaObjBase)(media, clientID, exports.getMediaURL, exports.getProgressiveStream, exports.getHLSStream, exports.fromURL, axiosInstance)];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); };
exports.fromMediaObj = fromMediaObj;
var fromDownloadLink = function (id, clientID, axiosInstance) { return __awaiter(void 0, void 0, void 0, function () {
    var redirectUri, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axiosInstance.get((0, util_1.appendURL)("https://api-v2.soundcloud.com/tracks/".concat(id, "/download"), 'client_id', clientID))];
            case 1:
                redirectUri = (_a.sent()).data.redirectUri;
                return [4 /*yield*/, axiosInstance.get(redirectUri, {
                        responseType: 'stream'
                    })];
            case 2:
                data = (_a.sent()).data;
                return [2 /*return*/, data];
        }
    });
}); };
exports.fromDownloadLink = fromDownloadLink;
/** @internal */
var download = function (url_1, clientID_1, axiosInstance_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1, clientID_1, axiosInstance_1], args_1, true), void 0, function (url, clientID, axiosInstance, useDownloadLink) {
        var info, err_2;
        if (useDownloadLink === void 0) { useDownloadLink = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, info_1.default)(url, clientID, axiosInstance)];
                case 1:
                    info = _a.sent();
                    if (!(info.downloadable && useDownloadLink)) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, exports.fromDownloadLink)(info.id, clientID, axiosInstance)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_2 = _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, (0, exports.fromMediaObj)(info.media.transcodings[0], clientID, axiosInstance)];
                case 6: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
exports.download = download;
var validatemedia = function (media) {
    if (!media.url || !media.format)
        return false;
    return true;
};
