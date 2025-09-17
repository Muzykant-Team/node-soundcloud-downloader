"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @internal */
const filterMedia = (media, predicateObj) => {
    return media.filter(({ format, snipped }) => {
        let match = false;
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
//# sourceMappingURL=filter-media.js.map