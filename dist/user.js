"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const util_1 = require("./util");
/** @internal */
const getUser = async (url, clientID, axiosInstance) => {
    const u = (0, util_1.appendURL)(util_1.resolveURL, 'url', url, 'client_id', clientID);
    const { data } = await axiosInstance.get(u);
    if (!data.avatar_url)
        throw new Error('JSON response is not a user. Is profile URL correct? : ' + url);
    return data;
};
exports.getUser = getUser;
//# sourceMappingURL=user.js.map