"use strict";
exports.__esModule = true;
/** @internal */
var filterMedia = function (media, predicateObj) {
    // Dodane: filtruj, aby nie wybierać snipped (czyli skróconych)
    return media.filter(function (_a) {
        var format = _a.format, snipped = _a.snipped;
        var match = false;
        if (predicateObj.protocol)
            match = format.protocol === predicateObj.protocol;
        if (predicateObj.format)
            match = format.mime_type === predicateObj.format;
        // DODANE: wyklucz jeśli snipped
        if (snipped)
            match = false;
        return match;
    });
};
exports["default"] = filterMedia;
