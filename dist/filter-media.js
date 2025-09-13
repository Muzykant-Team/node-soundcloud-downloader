"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
var filterMedia = function (media, predicateObj) {
    return media.filter(function (_a) {
        var format = _a.format, snipped = _a.snipped;
        var match = false;
        if (predicateObj.protocol)
            match = format.protocol === predicateObj.protocol;
        if (predicateObj.format)
            match = format.mime_type === predicateObj.format;
        // DODAJ TO:
        if (snipped)
            match = false;
        return match;
    });
};
exports.default = filterMedia;
