//#region src/util.d.ts
interface PaginatedQuery<T> {
  collection: T[];
  total_results?: number;
  next_href: string;
  query_urn: string;
}
declare const resolveURL = "https://api-v2.soundcloud.com/resolve";
declare const handleRequestErrs: (err: unknown) => Error;
declare const appendURL: (url: string, ...params: string[]) => string;
declare const extractIDFromPersonalizedTrackURL: (url: string) => string;
declare const kindMismatchError: (expected: string, received: string) => Error;
//#endregion
export { PaginatedQuery, appendURL, extractIDFromPersonalizedTrackURL, handleRequestErrs, kindMismatchError, resolveURL };
//# sourceMappingURL=util.d.cts.map