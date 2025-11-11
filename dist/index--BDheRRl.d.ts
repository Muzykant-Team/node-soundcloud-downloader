import { AxiosInstance } from "axios";

//#region src/protocols.d.ts
/**
 * Soundcloud streams tracks using these protocols.
 */
declare enum STREAMING_PROTOCOLS {
  HLS = "hls",
  PROGRESSIVE = "progressive",
}
/** @internal */
//#endregion
//#region src/formats.d.ts
/**
 * Audio formats a track can be encoded in.
 */
declare enum FORMATS {
  MP3 = "audio/mpeg",
  OPUS = "audio/ogg; codecs=\"opus\"",
  AAC = "audio/aac",
  AAC_LC = "audio/aac-lc",
  // Low Complexity AAC
  FLAC = "audio/flac",
  WAV = "audio/wav",
  WEBM_OPUS = "audio/webm; codecs=\"opus\"",
  // WebM container z Opus
  OGG_VORBIS = "audio/ogg; codecs=\"vorbis\"",
  // OGG z Vorbis
  ALAC = "audio/alac",
  // Apple Lossless
  AIFF = "audio/aiff",
  // AIFF PCM
  M4A = "audio/mp4; codecs=\"mp4a.40.2\"",
}
//#endregion
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
/**
 * Details about the track
 */
interface TrackInfo {
  kind: string;
  monetization_model: string;
  id: number;
  policy: string;
  comment_count?: number;
  full_duration?: number;
  downloadable?: false;
  created_at?: string;
  description?: string;
  media?: {
    transcodings: Transcoding[];
  };
  title?: string;
  publisher_metadata?: any;
  duration?: number;
  has_downloads_left?: boolean;
  artwork_url?: string;
  public?: boolean;
  streamable?: true;
  tag_list?: string;
  genre?: string;
  reposts_count?: number;
  label_name?: string;
  state?: string;
  last_modified?: string;
  commentable?: boolean;
  uri?: string;
  download_count?: number;
  likes_count?: number;
  display_date?: string;
  user_id?: number;
  waveform_url?: string;
  permalink?: string;
  permalink_url?: string;
  user?: User;
  playback_count?: number;
}
/**
 * Represents an audio link to a Soundcloud Track
 */
interface Transcoding {
  url: string;
  preset: string;
  snipped: boolean;
  format: {
    protocol: STREAMING_PROTOCOLS;
    mime_type: FORMATS;
  };
}
//#endregion
//#region src/filter-media.d.ts
interface FilterPredicateObject {
  protocol?: STREAMING_PROTOCOLS;
  format?: FORMATS;
}
//#endregion
//#region src/util.d.ts
interface PaginatedQuery<T$1> {
  collection: T$1[];
  total_results?: number;
  next_href: string;
  query_urn: string;
}
//#endregion
//#region src/search.d.ts
interface SearchOptions {
  limit?: number;
  offset?: number;
  resourceType?: SoundcloudResource | 'all';
  query?: string;
  nextHref?: string;
}
type SoundcloudResource = 'tracks' | 'users' | 'albums' | 'playlists';
//#endregion
//#region src/likes.d.ts
interface Like {
  created_at: string;
  kind: string;
  track: TrackInfo;
}
interface GetLikesOptions {
  profileUrl?: string;
  id?: number;
  limit?: number;
  offset?: number;
  nextHref?: string;
}
//#endregion
//#region src/index.d.ts
declare enum SCDLErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_URL = "INVALID_URL",
  CLIENT_ID_ERROR = "CLIENT_ID_ERROR",
  TRACK_NOT_FOUND = "TRACK_NOT_FOUND",
  REGION_RESTRICTED = "REGION_RESTRICTED",
  NOT_STREAMABLE = "NOT_STREAMABLE",
  SAMPLE_TRACK = "SAMPLE_TRACK",
  FORMAT_NOT_FOUND = "FORMAT_NOT_FOUND",
  FILE_SYSTEM_ERROR = "FILE_SYSTEM_ERROR",
  PARSING_ERROR = "PARSING_ERROR",
  RATE_LIMITED = "RATE_LIMITED",
}
declare class SCDLError extends Error {
  readonly type: SCDLErrorType;
  readonly originalError?: Error;
  readonly url?: string;
  readonly retryAfter?: number;
  constructor(message: string, type: SCDLErrorType, originalError?: Error, url?: string, retryAfter?: number);
}
interface SCDLOptions {
  clientID?: string;
  saveClientID?: boolean;
  filePath?: string;
  axiosInstance?: AxiosInstance;
  stripMobilePrefix?: boolean;
  convertFirebaseLinks?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  validateUrls?: boolean;
}
declare class SCDL {
  STREAMING_PROTOCOLS: {
    [key: string]: STREAMING_PROTOCOLS;
  };
  FORMATS: {
    [key: string]: FORMATS;
  };
  private _clientID?;
  private _filePath?;
  private _maxRetries;
  private _retryDelay;
  private _timeout;
  private _validateUrls;
  axios: AxiosInstance;
  saveClientID: boolean;
  stripMobilePrefix: boolean;
  convertFirebaseLinks: boolean;
  constructor(options?: SCDLOptions);
  /**
   * Parsuje nagłówek retry-after który może być w sekundach lub jako data HTTP
   * @internal
   */
  private _parseRetryAfter;
  /**
   * Konfiguruje interceptory dla axios
   * @internal
   */
  private _setupAxiosInterceptors;
  /**
   * Wykonuje operację z retry logic
   * @internal
   */
  private _withRetry;
  /**
   * Pomocnicza funkcja delay
   * @internal
   */
  private _delay;
  /**
   * Waliduje URL z lepszą obsługą błędów
   * @internal
   */
  private _validateUrl;
  /**
   * Returns a media Transcoding that matches the given predicate object
   * @param media - The Transcodings to filter
   * @param predicateObj - The desired Transcoding object to match
   * @returns An array of Transcodings that match the predicate object
   */
  filterMedia(media: Transcoding[], predicateObj: FilterPredicateObject): any;
  /**
   * Get the audio of a given track. It returns the first format found.
   *
   * @param url - The URL of the Soundcloud track
   * @param useDirectLink - Whether or not to use the download link if the artist has set the track to be downloadable. This has erratic behaviour on some environments.
   * @returns A ReadableStream containing the audio data
  */
  download(url: string, useDirectLink?: boolean): Promise<any>;
  /**
   *  Get the audio of a given track with the specified format
   * @param url - The URL of the Soundcloud track
   * @param format - The desired format
  */
  downloadFormat(url: string, format: FORMATS): Promise<any>;
  /**
   * Returns info about a given track.
   * @param url - URL of the Soundcloud track
   * @returns Info about the track
  */
  getInfo(url: string): Promise<any>;
  /**
   * Returns info about the given track(s) specified by ID.
   * @param ids - The ID(s) of the tracks
   * @returns Info about the track
   */
  getTrackInfoByID(ids: number[], playlistID?: number, playlistSecretToken?: string): Promise<any>;
  /**
   * Returns info about the given set
   * @param url - URL of the Soundcloud set
   * @returns Info about the set
   */
  getSetInfo(url: string): Promise<any>;
  /**
   * Searches for tracks/playlists for the given query
   * @param options - The search option
   * @returns SearchResponse
   */
  search(options: SearchOptions): Promise<any>;
  /**
   * Finds related tracks to the given track specified by ID
   * @param id - The ID of the track
   * @param limit - The number of results to return
   * @param offset - Used for pagination, set to 0 if you will not use this feature.
   */
  related(id: number, limit: number, offset?: number): Promise<any>;
  /**
   * Returns the audio streams and titles of the tracks in the given playlist.
   * @param url - The url of the playlist
   */
  downloadPlaylist(url: string): Promise<[ReadableStream<any>[], String[]]>;
  /**
   * Returns track information for a user's likes
   * @param options - Can either be the profile URL of the user, or their ID
   * @returns - An array of tracks
   */
  getLikes(options: GetLikesOptions): Promise<PaginatedQuery<Like>>;
  /**
   * Returns information about a user
   * @param url - The profile URL of the user
   */
  getUser(url: string): Promise<User>;
  /**
   * Sets the instance of Axios to use to make requests to SoundCloud API
   * @param instance - An instance of Axios
   */
  setAxiosInstance(instance: AxiosInstance): void;
  /**
   * Returns whether or not the given URL is a valid Soundcloud URL
   * @param url - URL of the Soundcloud track
  */
  isValidUrl(url: string): any;
  /**
   * Returns whether or not the given URL is a valid playlist SoundCloud URL
   * @param url - The URL to check
   */
  isPlaylistURL(url: string): any;
  /**
   * Returns true if the given URL is a personalized track URL. (of the form https://soundcloud.com/discover/sets/personalized-tracks::user-sdlkfjsldfljs:847104873)
   * @param url - The URL to check
   */
  isPersonalizedTrackURL(url: string): any;
  /**
   * Returns true if the given URL is a Firebase URL (of the form https://soundcloud.app.goo.gl/XXXXXXXX)
   * @param url - The URL to check
   */
  isFirebaseURL(url: string): any;
  getClientID(): Promise<string>;
  /** @internal */
  setClientID(clientID?: string): Promise<string>;
  /** @internal */
  private _getClientIDFromFile;
  /**
   * Prepares the given URL by stripping its mobile prefix (if this.stripMobilePrefix is true)
   * and converting it to a regular URL (if this.convertFireBaseLinks is true.)
   * @param url
   */
  prepareURL(url: string): Promise<string>;
  /**
   * Sprawdza czy błąd można ponowić
   */
  isRetryableError(error: SCDLError): boolean;
  /**
   * Czyści cache client ID (zmusza do ponownego pobrania)
   */
  clearClientID(): void;
  /**
   * Sprawdza status połączenia z SoundCloud API
   */
  healthCheck(): Promise<{
    status: 'ok' | 'error';
    clientID?: string;
    error?: string;
  }>;
  /**
   * Ustawia opcje retry dla instancji
   */
  setRetryOptions(maxRetries: number, retryDelay: number): void;
  /**
   * Pobiera obecne ustawienia retry
   */
  getRetryOptions(): {
    maxRetries: number;
    retryDelay: number;
  };
  /**
   * Ustawia timeout dla żądań
   */
  setTimeout(timeout: number): void;
  /**
   * Pobiera obecny timeout
   */
  getTimeout(): number;
  /**
   * Włącza/wyłącza walidację URL
   */
  setUrlValidation(validate: boolean): void;
  /**
   * Sprawdza czy walidacja URL jest włączona
   */
  isUrlValidationEnabled(): boolean;
}
declare const scdl: SCDL;
declare const create: (options: SCDLOptions) => SCDL;
//#endregion
export { SCDL, SCDLError, SCDLErrorType, SCDLOptions, create, scdl as default };
//# sourceMappingURL=index--BDheRRl.d.ts.map