/* eslint-disable camelcase */
import type { AxiosInstance } from 'axios'
import type { TrackInfo, User, SetInfo } from './info'
import { appendURL, type PaginatedQuery } from './util'

const baseURL = 'https://api-v2.soundcloud.com/search'

export interface RelatedResponse<T> extends PaginatedQuery<T> {
  variant: string
}

export interface SearchOptions {
  limit?: number,
  offset?: number,
  resourceType?: SoundcloudResource | 'all',
  query?: string,
  nextHref?: string,
  q?: string
}

export type SearchResponseAll = PaginatedQuery<User | SetInfo | TrackInfo>
export type SoundcloudResource = 'tracks' | 'users' | 'albums' | 'playlists'

const validResourceTypes = ['tracks', 'users', 'albums', 'playlists', 'all'] as const

// Funkcja do normalizacji stringów (usuwa znaki specjalne, akcenty, małe litery)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // usuń akcenty
    .replace(/[^\w\s]/g, ' ') // zamień znaki specjalne na spacje
    .replace(/\s+/g, ' ') // zamień wielokrotne spacje na jedną
    .trim()
}

// Funkcja do obliczania podobieństwa między tytułami
const calculateSimilarity = (query: string, title: string): number => {
  const normalizedQuery = normalizeString(query)
  const normalizedTitle = normalizeString(title)

  // Jeśli tytuły są identyczne po normalizacji - maksymalny wynik
  if (normalizedQuery === normalizedTitle) {
    return 1000
  }

  // Sprawdź czy query jest dokładnie zawarte w tytule
  if (normalizedTitle.includes(normalizedQuery)) {
    return 800
  }

  // Sprawdź czy wszystkie słowa z query są w tytule
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0)
  const titleWords = normalizedTitle.split(' ').filter(word => word.length > 0)

  let matchingWords = 0
  let exactMatches = 0

  queryWords.forEach(queryWord => {
    // Sprawdź dokładne dopasowanie
    if (titleWords.some(titleWord => titleWord === queryWord)) {
      exactMatches++
      matchingWords++
    }
    // Sprawdź częściowe dopasowanie (słowo zawiera się w innym)
    else if (titleWords.some(titleWord =>
      titleWord.includes(queryWord) || queryWord.includes(titleWord)
    )) {
      matchingWords += 0.5
    }
  })

  // Kara za dodatkowe słowa w tytule (preferuj krótsze, dokładniejsze tytuły)
  const extraWords = Math.max(0, titleWords.length - queryWords.length)
  const lengthPenalty = extraWords * 10

  // Bonus za dokładne dopasowania
  const exactMatchBonus = exactMatches * 100

  // Bazowy wynik na podstawie % dopasowanych słów
  const baseScore = (matchingWords / queryWords.length) * 500

  return Math.max(0, baseScore + exactMatchBonus - lengthPenalty)
}

// Funkcja do sprawdzania czy to remix/cover/live version
const isOriginalVersion = (title: string, query: string): boolean => {
  const normalizedTitle = normalizeString(title)

  const modifierKeywords = [
    'remix', 'cover', 'live', 'acoustic', 'instrumental', 'karaoke',
    'extended', 'radio edit', 'club mix', 'dub', 'version', 'edit',
    'remaster', 'rework', 'bootleg', 'mashup', 'flip'
  ]

  // Sprawdź czy tytuł zawiera słowa wskazujące na modyfikację
  const hasModifiers = modifierKeywords.some(keyword =>
    normalizedTitle.includes(keyword)
  )

  // Sprawdź czy query zawiera te słowa (jeśli tak, to użytkownik ich szuka)
  const queryWantsModified = modifierKeywords.some(keyword =>
    normalizeString(query).includes(keyword)
  )

  // Jeśli query nie zawiera modyfikatorów, ale tytuł tak - to prawdopodobnie nie oryginał
  return !hasModifiers || queryWantsModified
}

/**
 * Waliduje czy track jest dostępny do streamowania
 * @internal
 */
const isTrackValid = (track: any): boolean => {
  // Podstawowe sprawdzenia
  if (!track || typeof track !== 'object') return false
  if (!track.permalink_url || !track.title) return false

  // Odrzucaj sample o długości w pobliżu 30s (29.5–30.5 sekundy)
  if (
    typeof track.duration === 'number' &&
    track.duration >= 29500 &&
    track.duration <= 30500
  ) return false

  // Sprawdź dostępność regionalną
  if ('region_restricted' in track && track.region_restricted === true) return false

  // Sprawdź czy można streamować
  if (track.streamable !== true) return false

  // Sprawdź stan utworu
  if (track.state && track.state !== 'finished') return false

  // Sprawdź policy (blokady)
  if (track.policy === 'BLOCK' || track.policy === 'SNIP') return false

  // Sprawdź czy ma media/transcodings
  if (!track.media || !track.media.transcodings || track.media.transcodings.length === 0) return false

  // Sprawdź czy ma dostępne formaty streamowania
  const hasValidFormat = track.media.transcodings.some((transcoding: any) =>
    transcoding &&
    transcoding.url &&
    (transcoding.format?.protocol === 'hls' || transcoding.format?.protocol === 'progressive')
  )

  if (!hasValidFormat) return false

  // Odrzucaj deleted/private tracks
  if (track.sharing === 'private' && !track.streamable) return false

  return true
}

/** @internal */
export const search = async (
  options: SearchOptions,
  axiosInstance: AxiosInstance,
  clientID: string
): Promise<SearchResponseAll> => {
  let url = ''
  if (!options.limit) options.limit = 20 // Zwiększ limit żeby mieć więcej opcji
  if (!options.offset) options.offset = 0
  if (!options.resourceType) options.resourceType = 'tracks'

  // Obsługa zarówno options.query jak i options.q
  const queryString = options.query || options.q

  if (options.nextHref) {
    url = appendURL(options.nextHref, 'client_id', clientID)
  } else if (queryString) {
    if (!validResourceTypes.includes(options.resourceType as any)) {
      throw new Error(
        `${options.resourceType} is not one of ${validResourceTypes
          .map(str => `'${str}'`)
          .join(', ')}`
      )
    }
    url = appendURL(
      `${baseURL}${options.resourceType === 'all' ? '' : `/${options.resourceType}`}`,
      'client_id',
      clientID,
      'q',
      queryString,
      'limit',
      String(options.limit),
      'offset',
      String(options.offset)
    )
  } else {
    throw new Error('One of options.query, options.q, or options.nextHref is required')
  }

  const { data } = await axiosInstance.get(url)

  if (options.resourceType === 'tracks' && Array.isArray(data.collection)) {
    // Filtruj nieprawidłowe tracki
    data.collection = data.collection.filter(isTrackValid)

    // Sortuj wyniki na podstawie dokładności dopasowania do query
    if (queryString) {
      data.collection.sort((a: any, b: any) => {
        const similarityA = calculateSimilarity(queryString, a.title)
        const similarityB = calculateSimilarity(queryString, b.title)

        // Bonus za oryginalną wersję
        const originalBonusA = isOriginalVersion(a.title, queryString) ? 50 : 0
        const originalBonusB = isOriginalVersion(b.title, queryString) ? 50 : 0

        // Bonus za popularność (ale mniejszy niż dokładność)
        const popularityA = (a.likes_count || 0) / 1000
        const popularityB = (b.likes_count || 0) / 1000

        const scoreA = similarityA + originalBonusA + popularityA
        const scoreB = similarityB + originalBonusB + popularityB

        return scoreB - scoreA
      })
    }

    // Ogranicz do oryginalnego limitu (ale po filtrowaniu i sortowaniu)
    data.collection = data.collection.slice(0, Math.min(options.limit, 10))
  }

  return data as SearchResponseAll
}

/** @internal */
export const related = async <T extends TrackInfo>(
  id: number,
  limit = 10,
  offset = 0,
  axiosInstance: AxiosInstance,
  clientID: string
): Promise<RelatedResponse<T>> => {
  const { data } = await axiosInstance.get(
    appendURL(
      `https://api-v2.soundcloud.com/tracks/${id}/related`,
      'client_id',
      clientID,
      'offset',
      String(offset),
      'limit',
      String(limit)
    )
  )

  // Zastosuj podobne filtrowanie dla related tracks
  if (Array.isArray(data.collection)) {
    data.collection = data.collection.filter((track: any) => {
      if (!track || typeof track !== 'object') return false
      if (!track.permalink_url || !track.title) return false

      // Odrzucaj sample ~30s
      if (
        typeof track.duration === 'number' &&
        track.duration >= 29500 &&
        track.duration <= 30500
      ) return false

      // Odrzucaj zbyt krótkie
      if (
        typeof track.duration === 'number' &&
        track.duration < 10000
      ) return false

      if (track.streamable !== true) return false
      if (track.state && track.state !== 'finished') return false
      if (track.policy === 'BLOCK' || track.policy === 'SNIP') return false

      return true
    })
  }

  return data as RelatedResponse<T>
}
