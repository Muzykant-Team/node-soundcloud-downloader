import { AxiosInstance } from "axios";
//#region src/url.d.ts
/**
 * Sprawdza, czy podany ciąg znaków jest prawidłowym adresem URL SoundCloud (standardowym, mobilnym lub Firebase).
 * @param url - Adres URL do przetestowania.
 * @param testFirebase - Czy uwzględnić sprawdzanie linków Firebase (domyślnie true).
 * @returns `true`, jeśli adres URL jest prawidłowy, w przeciwnym razie `false`.
 */
declare const isURL: (url: string, testFirebase?: boolean, stripMobilePrefix?: boolean) => boolean;
/**
 * Sprawdza, czy URL prowadzi do playlisty (setu) na SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli URL jest playlistą, w przeciwnym razie `false`.
 */
declare const isPlaylistURL: (url: string) => boolean;
/**
 * Sprawdza, czy URL jest linkiem do spersonalizowanej playlisty "Odkrywaj" na SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli URL jest spersonalizowaną playlistą, w przeciwnym razie `false`.
 */
declare const isPersonalizedTrackURL: (url: string) => boolean;
/**
 * Usuwa prefiks mobilny 'm.' z adresu URL SoundCloud.
 * @param url - Adres URL do przetworzenia.
 * @returns Adres URL bez prefiksu mobilnego lub oryginalny URL, jeśli nie był to link mobilny.
 */
declare const stripMobilePrefix: (url: string) => string;
/**
 * Sprawdza, czy URL jest skróconym linkiem Firebase od SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli to link Firebase, w przeciwnym razie `false`.
 */
/**
 * Sprawdza, czy URL jest skróconym linkiem SoundCloud (np. Firebase shortener lub on.soundcloud.com).
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli to skrócony link SoundCloud, w przeciwnym razie `false`.
 */
declare const isFirebaseURL: (url: string) => boolean;
/**
 * Konwertuje skrócony link Firebase na pełny adres URL SoundCloud.
 * Pobiera zawartość strony z linku Firebase i wyszukuje w niej docelowy URL.
 * @param url - Skrócony URL Firebase (np. https://soundcloud.app.goo.gl/xyz).
 * @param axiosInstance - Instancja Axios do wykonania zapytania HTTP.
 * @returns Obietnica (Promise) rozwiązująca się do pełnego adresu URL SoundCloud lub `undefined`, jeśli nie można go znaleźć.
 * @throws Błąd, jeśli nie uda się znaleźć docelowego URL.
 */
declare const convertFirebaseURL: (url: string, axiosInstance: AxiosInstance) => Promise<string | undefined>;
//#endregion
export { convertFirebaseURL, isURL as default, isURL, isFirebaseURL, isPersonalizedTrackURL, isPlaylistURL, stripMobilePrefix };
//# sourceMappingURL=url.d.mts.map