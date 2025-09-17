import axios, { type AxiosInstance } from 'axios';

// --- Wyrażenia regularne ---
// Używamy stałych (const) z nazwami pisanymi wielkimi literami dla lepszej czytelności.

/**
 * Regex dopasowujący standardowe i mobilne adresy URL SoundCloud.
 * Obsługuje:
 * - http://soundcloud.com/...
 * - https://soundcloud.com/...
 * - http://m.soundcloud.com/...
 * - https://m.soundcloud.com/...
 */
const SOUNDCLOUD_URL_REGEX = /^https?:\/\/(m\.)?soundcloud\.com\/.+/;

/**
 * Regex dopasowujący adresy URL skracacza linków Firebase używanego przez SoundCloud.
 */
const FIREBASE_URL_REGEX = /^https?:\/\/soundcloud\.app\.goo\.gl\/.+/;

/**
 * Ogólny regex do wyszukiwania (scrapowania) dowolnego adresu URL w tekście.
 * Używany do znalezienia docelowego linku SoundCloud w odpowiedzi z linku Firebase.
 */
const GENERIC_URL_SCRAPE_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,500}\.[a-zA-Z0-9()]{1,500}\b([-a-zA-Z0-9()@:%_+.~#?&/\\=;]*)/g;

// --- Funkcje pomocnicze ---

/**
 * Sprawdza, czy podany ciąg znaków jest prawidłowym adresem URL SoundCloud (standardowym, mobilnym lub Firebase).
 * @param url - Adres URL do przetestowania.
 * @param testFirebase - Czy uwzględnić sprawdzanie linków Firebase (domyślnie true).
 * @returns `true`, jeśli adres URL jest prawidłowy, w przeciwnym razie `false`.
 */
export const isURL = (url: string, testFirebase: boolean = true): boolean => {
  if (typeof url !== 'string') return false;
  // Sprawdza, czy pasuje do standardowego/mobilnego URL-a LUB (jeśli włączone) do URL-a Firebase.
  return SOUNDCLOUD_URL_REGEX.test(url) || (testFirebase && FIREBASE_URL_REGEX.test(url));
};

/**
 * Sprawdza, czy URL prowadzi do playlisty (setu) na SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli URL jest playlistą, w przeciwnym razie `false`.
 */
export const isPlaylistURL = (url: string): boolean => {
  // `isURL` sprawdza teraz również format linku Firebase, więc testFirebase ustawiamy na false,
  // aby upewnić się, że analizujemy już rozwiązany URL SoundCloud.
  if (!isURL(url, false) || !url.includes('/sets/')) {
    return false;
  }
  try {
    const parsedUrl = new URL(url);
    // Dodatkowe, bardziej rygorystyczne sprawdzenie ścieżki
    return parsedUrl.pathname.includes('/sets/');
  } catch {
    return false;
  }
};

/**
 * Sprawdza, czy URL jest linkiem do spersonalizowanej playlisty "Odkrywaj" na SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli URL jest spersonalizowaną playlistą, w przeciwnym razie `false`.
 */
export const isPersonalizedTrackURL = (url: string): boolean => {
  if (!isURL(url, false)) return false;
  return url.startsWith('https://soundcloud.com/discover/sets/personalized-tracks::');
};

/**
 * Usuwa prefiks mobilny 'm.' z adresu URL SoundCloud.
 * @param url - Adres URL do przetworzenia.
 * @returns Adres URL bez prefiksu mobilnego lub oryginalny URL, jeśli nie był to link mobilny.
 */
export const stripMobilePrefix = (url: string): string => {
  try {
    const urlObject = new URL(url);
    if (urlObject.hostname === 'm.soundcloud.com') {
      urlObject.hostname = 'soundcloud.com';
      return urlObject.toString();
    }
    return url;
  } catch {
    // Zwraca oryginalny URL w przypadku błędu parsowania (np. nieprawidłowy URL)
    return url;
  }
};

/**
 * Sprawdza, czy URL jest skróconym linkiem Firebase od SoundCloud.
 * @param url - Adres URL do sprawdzenia.
 * @returns `true`, jeśli to link Firebase, w przeciwnym razie `false`.
 */
export const isFirebaseURL = (url: string): boolean => {
  return FIREBASE_URL_REGEX.test(url);
};

/**
 * Konwertuje skrócony link Firebase na pełny adres URL SoundCloud.
 * Pobiera zawartość strony z linku Firebase i wyszukuje w niej docelowy URL.
 * @param url - Skrócony URL Firebase (np. https://soundcloud.app.goo.gl/xyz).
 * @param axiosInstance - Instancja Axios do wykonania zapytania HTTP.
 * @returns Obietnica (Promise) rozwiązująca się do pełnego adresu URL SoundCloud lub `undefined`, jeśli nie można go znaleźć.
 * @throws Błąd, jeśli nie uda się znaleźć docelowego URL.
 */
export const convertFirebaseURL = async (url: string, axiosInstance: AxiosInstance): Promise<string | undefined> => {
  const urlObject = new URL(url);
  // Dodanie parametru 'd=1' może czasem pomóc w ominięciu przekierowań i uzyskaniu strony z metadanymi.
  urlObject.searchParams.set('d', '1');

  // Pobieramy zawartość HTML ze skróconego linku, ponieważ często zawiera on docelowy URL w tagach meta lub skryptach.
  const { data: htmlContent } = await axiosInstance.get<string>(urlObject.toString());
  
  const allUrlsInHtml = htmlContent.match(GENERIC_URL_SCRAPE_REGEX);

  if (!allUrlsInHtml) {
    throw new Error(`Could not find any URL in the response from the Firebase URL: ${url}`);
  }

  // Znajdź pierwszy URL, który jest prawidłowym linkiem do SoundCloud.
  const soundcloudUrl = allUrlsInHtml.find(match => SOUNDCLOUD_URL_REGEX.test(match));

  if (!soundcloudUrl) {
    return undefined;
  }

  // Czasami URL w odpowiedzi jest zakodowany (np. \u003d zamiast =).
  // Ta operacja dekoduje znaki Unicode do ich standardowej postaci.
  // Przykład: '.../tracks\u003d123' -> '.../tracks=123'
  return soundcloudUrl.replace(/\\u([\d\w]{4})/gi, (_match, grp) =>
    String.fromCharCode(parseInt(grp, 16)),
  );
};

// Eksport domyślny pozostaje bez zmian dla zgodności wstecznej.
export default isURL;
