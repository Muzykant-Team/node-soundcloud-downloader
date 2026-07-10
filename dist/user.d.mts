import { AxiosInstance } from "axios";
//#region src/info.d.ts
/**
 * A Soundcloud user
 */
interface User {
  kind: string;
  avatar_url: string;
  city: string;
  comments_count: number;
  country_code: string;
  created_at: string;
  description: string;
  followers_count: number;
  followings_count: number;
  first_name: string;
  full_name: string;
  groups_count: number;
  id: number;
  last_name: string;
  permalink_url: string;
  uri: string;
  username: string;
}
//#endregion
//#region src/user.d.ts
/** @internal */
declare const getUser: (url: string, clientID: string, axiosInstance: AxiosInstance) => Promise<User>;
//#endregion
export { getUser };
//# sourceMappingURL=user.d.mts.map