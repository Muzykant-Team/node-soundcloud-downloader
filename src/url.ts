import axios, { type AxiosInstance } from 'axios';

// --- Wyrażenia regularne ---
const SOUNDCLOUD_URL_REGEX = /^https?:\/\/(?:m\.)?soundcloud\.com\/.+/i;
const FIREBASE_URL_REGEX = /^https?:\/\/(?:soundcloud\.app\.goo\.gl|on\.soundcloud\.com)\/.+/i;
const SND_SC_REGEX = /^https?:\/\/snd\.sc\/.+/i; // stary krótki link SoundCloud (wciąż spotykany)
const SHORTLINKS_REGEX = new RegExp(
  `(?:${FIREBASE_URL_REGEX.source.replace(/^\\^|\\$\/i$/g, '')}|${SND_SC_REGEX.source.replace(/^\\^|\\$\/i$/g, '')})`,
  'i',
);

// Ogólny regex do wyszukiwania (scrapowania) dowolnego adresu URL w tekście.
// Pozwala też na znaki zakodowane jak \u003d itp. (wyłapiemy je i zdekodujemy)
const GENERIC_URL_SCRAPE_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,500}\.[a-zA-Z0-9()]{1,500}\b([-a-zA-Z0-9()@:%_+.~#?&/\\=;]*)/gi;

// --- Funkcje pomocnicze ---
export const isURL = (url: string, testFirebase: boolean = true, stripMobilePrefix?: boolean): boolean => {
  if (typeof url !== 'string') return false;
  const candidate = stripMobilePrefix ? stripMobilePrefixFn(url) : url;
  return SOUNDCLOUD_URL_REGEX.test(candidate) || (testFirebase && SHORTLINKS_REGEX.test(candidate));
};

export const isPlaylistURL = (url: string): boolean => {
  if (!isURL(url, false)) return false;
  try {
    const parsed = new URL(url);
    return parsed.pathname.includes('/sets/');
  } catch {
    return false;
  }
};

export const isPersonalizedTrackURL = (url: string): boolean => {
  if (!isURL(url, false)) return false;
  return url.startsWith('https://soundcloud.com/discover/sets/personalized-tracks::');
};

export const stripMobilePrefix = (url: string): string => stripMobilePrefixFn(url);

// internal helper used to avoid name clash with exported name above
function stripMobilePrefixFn(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.toLowerCase() === 'm.soundcloud.com') {
      u.hostname = 'soundcloud.com';
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export const isFirebaseURL = (url: string): boolean => {
  return FIREBASE_URL_REGEX.test(url) || SND_SC_REGEX.test(url);
}

/**
 * Dekoduje sekwencje \uXXXX oraz kilka podstawowych encji HTML (&amp; &lt; &gt; &#x27; &quot;)
 */
function decodeEscapes(input: string): string {
  // \uXXXX decode
  const unicodeDecoded = input.replace(/\\u([\dA-Fa-f]{4})/g, (_m, grp) =>
    String.fromCharCode(parseInt(grp, 16)),
  );
  // podstawowe encje HTML
  return unicodeDecoded
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

function extractUrlsFromHtml(html: string): string[] {
  const matches = [...(html.matchAll(GENERIC_URL_SCRAPE_REGEX))].map(m => m[0]);
  // dodatkowo zdekoduj zakodowane fragmenty
  return matches.map(decodeEscapes);
}

/**
 * Normalizuje URL SoundCloud: usuwa mobile prefix i trim.
 */
function normalizeUrl(url: string): string {
  return stripMobilePrefixFn(String(url).trim());
}

/**
 * Konwertuje skrócony link Firebase/shortlink SoundCloud do pełnego URL.
 * Zwraca Promise<string | undefined>.
 *
 * Zasady:
 * - retry (do 3 prób) z prostym backoffem,
 * - timeout i ograniczenie maxContentLength,
 * - sprawdzanie finalnego URL z przekierowania (jeśli axios go udostępnia),
 * - bez throw dla "nie znaleziono URL", zwracamy undefined — caller może to łatwo obsłużyć.
 */
export const convertFirebaseURL = async (url: string, axiosInstance?: AxiosInstance): Promise<string | undefined> => {
  const client = axiosInstance ?? axios.create();
  const MAX_TRIES = 3;
  const TIMEOUT = 5000; // ms
  const MAX_CONTENT = 5 * 1024 * 1024; // 5MB
  let lastErr: unknown = null;

  // przygotuj URL (dodaj d=1 by dostać stronę z meta jeśli możliwe)
  let urlObject: URL;
  try {
    urlObject = new URL(url);
  } catch (err) {
    throw new Error(`Invalid URL passed to convertFirebaseURL: ${url}`);
  }
  urlObject.searchParams.set('d', '1');
  const finalRequestUrl = urlObject.toString();

  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      const resp = await client.get<string>(finalRequestUrl, {
        timeout: TIMEOUT,
        maxContentLength: MAX_CONTENT,
        responseType: 'text',
        // akceptujemy 2xx i 3xx (w razie gdyby serwer od razu przekierował)
        validateStatus: status => status >= 200 && status < 400,
        // axios domyślnie podąża za redirectami (max 5), więc finalny URL może być w resp.request
      });

      // jeśli axios podążył za redirectem, spróbuj odczytać finalny URL (node http internals)
      // różne wersje node/axios mają różne pola — sprawdź ostrożnie
      try {
        // @ts-ignore - dostęp do wewnętrznego pola request/response zależny od środowiska
        const maybeFinal = resp.request?.res?.responseUrl || resp.request?.res?.req?.path;
        if (maybeFinal && typeof maybeFinal === 'string' && SOUNDCLOUD_URL_REGEX.test(maybeFinal)) {
          return normalizeUrl(maybeFinal);
        }
      } catch {
        // ignore
      }

      const html = String(resp.data ?? '');
      // spróbuj znaleźć URL-e w HTML-u
      const urlsFound = extractUrlsFromHtml(html);

      if (!urlsFound.length) {
        // brak URL-y -> zwracamy undefined (caller może zdecydować)
        return undefined;
      }

      // wybierz pierwszy, który wygląda jak SoundCloud URL
      const soundcloudCandidate = urlsFound.find(u => {
        const normalized = normalizeUrl(u);
        return SOUNDCLOUD_URL_REGEX.test(normalized);
      });

      if (soundcloudCandidate) {
        return normalizeUrl(soundcloudCandidate);
      }

      // jeżeli nie znaleźliśmy bezpośrednio soundcloud.com, ale znaleźliśmy inny shortlink, spróbuj go rozwiązać rekurencyjnie (ostrożnie, tylko raz)
      const shortlinkCandidate = urlsFound.find(u => SHORTLINKS_REGEX.test(u));
      if (shortlinkCandidate && shortlinkCandidate !== url) {
        // wywołanie rekurencyjne (jedna głębia)
        try {
          return await convertFirebaseURL(shortlinkCandidate, client);
        } catch {
          // jeżeli rekurencja się nie powiedzie, dalej próbujemy inne metody
        }
      }

      // nic sensownego — zwróć undefined
      return undefined;
    } catch (err) {
      lastErr = err;
      // proste backoff
      const backoff = 200 * attempt;
      await new Promise(r => setTimeout(r, backoff));
      // kontynuuj retry
    }
  }

  // po wszystkich próbach - rzuć bardziej opisowy błąd, żeby caller wiedział, że pobranie strony się nie powiodło
  throw new Error(`Failed to fetch/resolve Firebase/shortlink URL after ${MAX_TRIES} attempts. Last error: ${String(lastErr)}`);
};

// Eksport domyślny (zachowujemy kompatybilność)
export default isURL;
