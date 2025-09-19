import sckey from 'soundcloud-key-fetch'

import getInfo, { getSetInfo, Transcoding, getTrackInfoByID, TrackInfo, User } from './info'
import filterMedia, { FilterPredicateObject } from './filter-media'
import { download, fromMediaObj } from './download'

import isValidURL, { convertFirebaseURL, isFirebaseURL, isPersonalizedTrackURL, isPlaylistURL, stripMobilePrefix } from './url'

import STREAMING_PROTOCOLS, { _PROTOCOLS } from './protocols'
import FORMATS, { _FORMATS } from './formats'
import { search, related, SoundcloudResource, SearchOptions } from './search'
import { downloadPlaylist } from './download-playlist'
import axios, { AxiosInstance, AxiosError } from 'axios'

import * as path from 'path'
import * as fs from 'fs'
import { PaginatedQuery } from './util'
import { GetLikesOptions, getLikes, Like } from './likes'
import { getUser } from './user'

// Nowe typy błędów dla lepszej obsługi
export enum SCDLErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_URL = 'INVALID_URL',
  CLIENT_ID_ERROR = 'CLIENT_ID_ERROR',
  TRACK_NOT_FOUND = 'TRACK_NOT_FOUND',
  REGION_RESTRICTED = 'REGION_RESTRICTED',
  NOT_STREAMABLE = 'NOT_STREAMABLE',
  SAMPLE_TRACK = 'SAMPLE_TRACK',
  FORMAT_NOT_FOUND = 'FORMAT_NOT_FOUND',
  FILE_SYSTEM_ERROR = 'FILE_SYSTEM_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  RATE_LIMITED = 'RATE_LIMITED'
}

export class SCDLError extends Error {
  public readonly type: SCDLErrorType
  public readonly originalError?: Error
  public readonly url?: string
  public readonly retryAfter?: number

  constructor(
    message: string,
    type: SCDLErrorType,
    originalError?: Error,
    url?: string,
    retryAfter?: number
  ) {
    super(message)
    this.name = 'SCDLError'
    this.type = type
    this.originalError = originalError
    this.url = url
    this.retryAfter = retryAfter
    
    // Zachowaj stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SCDLError)
    }
  }
}

/** @internal */
const downloadFormat = async (url: string, clientID: string, format: FORMATS, axiosInstance: AxiosInstance) => {
  try {
    const info = await getInfo(url, clientID, axiosInstance)
    const filtered = filterMedia(info.media.transcodings, { format: format })
    if (filtered.length === 0) {
      throw new SCDLError(
        `Nie można znaleźć mediów w określonym formacie: (${format})`,
        SCDLErrorType.FORMAT_NOT_FOUND,
        undefined,
        url
      )
    }
    return await fromMediaObj(filtered[0], clientID, axiosInstance)
  } catch (error) {
    if (error instanceof SCDLError) throw error
    throw new SCDLError(
      `Błąd podczas pobierania formatu: ${error.message}`,
      SCDLErrorType.NETWORK_ERROR,
      error as Error,
      url
    )
  }
}

interface ClientIDData {
  clientID: string,
  date: Date
}

export interface SCDLOptions {
  // Set a custom client ID to use
  clientID?: string,
  // Set to true to save client ID to file
  saveClientID?: boolean,
  // File path to save client ID, defaults to '../client_id.json"
  filePath?: string,
  // Custom axios instance to use
  axiosInstance?: AxiosInstance,
  // Whether or not to automatically convert mobile links to regular links, defaults to true
  stripMobilePrefix?: boolean,
  // Whether or not to automatically convert SoundCloud Firebase links copied from the mobile app
  // (e.g. https://soundcloud.app.goo.gl/xxxxxxxxx), defaults to true.
  convertFirebaseLinks?: boolean,
  // Nowe opcje
  // Maximum number of retries for failed requests
  maxRetries?: number,
  // Base delay between retries in milliseconds
  retryDelay?: number,
  // Request timeout in milliseconds
  timeout?: number,
  // Whether to validate URLs before processing
  validateUrls?: boolean
}

// Nowe interfejsy pomocnicze
interface RetryConfig {
  maxRetries: number
  retryDelay: number
  currentAttempt: number
}

export class SCDL {
  STREAMING_PROTOCOLS: { [key: string]: STREAMING_PROTOCOLS }
  FORMATS: { [key: string]: FORMATS }

  private _clientID?: string
  private _filePath?: string
  private _maxRetries: number
  private _retryDelay: number
  private _timeout: number
  private _validateUrls: boolean

  axios: AxiosInstance
  saveClientID = process.env.SAVE_CLIENT_ID ? process.env.SAVE_CLIENT_ID.toLowerCase() === 'true' : false

  stripMobilePrefix: boolean
  convertFirebaseLinks: boolean

  constructor (options?: SCDLOptions) {
    if (!options) options = {}
    
    // Zachowaj starą logikę
    if (options.saveClientID) {
      this.saveClientID = options.saveClientID
      if (options.filePath) this._filePath = options.filePath
    } else {
      if (options.clientID) {
        this._clientID = options.clientID
      }
    }

    // Nowe opcje z wartościami domyślnymi
    this._maxRetries = options.maxRetries ?? 3
    this._retryDelay = options.retryDelay ?? 1000
    this._timeout = options.timeout ?? 30000
    this._validateUrls = options.validateUrls ?? true

    if (options.axiosInstance) {
      this.setAxiosInstance(options.axiosInstance)
    } else {
      this.setAxiosInstance(axios)
    }

    // Konfiguruj axios z timeout i interceptorami
    this._setupAxiosInterceptors()

    if (options.stripMobilePrefix === undefined) options.stripMobilePrefix = true
    if (options.convertFirebaseLinks === undefined) options.convertFirebaseLinks = true

    this.stripMobilePrefix = options.stripMobilePrefix
    this.convertFirebaseLinks = options.convertFirebaseLinks

    // Ustaw protokoły i formaty
    this.STREAMING_PROTOCOLS = _PROTOCOLS
    this.FORMATS = _FORMATS
  }

  /**
   * Konfiguruje interceptory dla axios
   * @internal
   */
  private _setupAxiosInterceptors() {
    this.axios.defaults.timeout = this._timeout

    // Response interceptor dla obsługi błędów
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status
          if (status === 429) {
            const retryAfter = error.response.headers['retry-after'] 
              ? parseInt(error.response.headers['retry-after'] as string) * 1000 
              : this._retryDelay
            throw new SCDLError(
              'Przekroczono limit zapytań. Spróbuj ponownie później.',
              SCDLErrorType.RATE_LIMITED,
              error,
              error.config?.url,
              retryAfter
            )
          } else if (status === 404) {
            throw new SCDLError(
              'Nie znaleziono zasobu.',
              SCDLErrorType.TRACK_NOT_FOUND,
              error,
              error.config?.url
            )
          }
        }
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new SCDLError(
            'Przekroczono limit czasu żądania.',
            SCDLErrorType.NETWORK_ERROR,
            error,
            error.config?.url
          )
        }
        
        throw new SCDLError(
          `Błąd sieci: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error,
          error.config?.url
        )
      }
    )
  }

  /**
   * Wykonuje operację z retry logic
   * @internal
   */
  private async _withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig: RetryConfig = {
      maxRetries: this._maxRetries,
      retryDelay: this._retryDelay,
      currentAttempt: 0,
      ...config
    }

    while (retryConfig.currentAttempt <= retryConfig.maxRetries) {
      try {
        return await operation()
      } catch (error) {
        retryConfig.currentAttempt++
        
        if (error instanceof SCDLError) {
          // Niektóre błędy nie powinny być retryowane
          if ([
            SCDLErrorType.INVALID_URL,
            SCDLErrorType.REGION_RESTRICTED,
            SCDLErrorType.NOT_STREAMABLE,
            SCDLErrorType.SAMPLE_TRACK,
            SCDLErrorType.FORMAT_NOT_FOUND
          ].includes(error.type)) {
            throw error
          }

          // Użyj retry-after dla rate limiting
          if (error.type === SCDLErrorType.RATE_LIMITED && error.retryAfter) {
            if (retryConfig.currentAttempt <= retryConfig.maxRetries) {
              await this._delay(error.retryAfter)
              continue
            }
          }
        }

        if (retryConfig.currentAttempt > retryConfig.maxRetries) {
          throw error
        }

        // Exponential backoff
        const delay = retryConfig.retryDelay * Math.pow(2, retryConfig.currentAttempt - 1)
        await this._delay(delay)
      }
    }

    throw new Error('Nieoczekiwany błąd w logice retry')
  }

  /**
   * Pomocnicza funkcja delay
   * @internal
   */
  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Waliduje URL z lepszą obsługą błędów
   * @internal
   */
  private _validateUrl(url: string, operation: string): void {
    if (!this._validateUrls) return

    try {
      if (!url || typeof url !== 'string') {
        throw new SCDLError(
          'URL musi być niepustym stringiem.',
          SCDLErrorType.INVALID_URL,
          undefined,
          url
        )
      }

      if (!this.isValidUrl(url)) {
        throw new SCDLError(
          `Nieprawidłowy URL SoundCloud: ${url}`,
          SCDLErrorType.INVALID_URL,
          undefined,
          url
        )
      }
    } catch (error) {
      if (error instanceof SCDLError) throw error
      throw new SCDLError(
        `Błąd podczas walidacji URL dla operacji ${operation}: ${error.message}`,
        SCDLErrorType.INVALID_URL,
        error as Error,
        url
      )
    }
  }

  /**
   * Returns a media Transcoding that matches the given predicate object
   * @param media - The Transcodings to filter
   * @param predicateObj - The desired Transcoding object to match
   * @returns An array of Transcodings that match the predicate object
   */
  filterMedia (media: Transcoding[], predicateObj: FilterPredicateObject) {
    try {
      return filterMedia(media, predicateObj)
    } catch (error) {
      throw new SCDLError(
        `Błąd podczas filtrowania mediów: ${error.message}`,
        SCDLErrorType.PARSING_ERROR,
        error as Error
      )
    }
  }

  /**
   * Get the audio of a given track. It returns the first format found.
   *
   * @param url - The URL of the Soundcloud track
   * @param useDirectLink - Whether or not to use the download link if the artist has set the track to be downloadable. This has erratic behaviour on some environments.
   * @returns A ReadableStream containing the audio data
  */
  async download (url: string, useDirectLink = true) {
    return this._withRetry(async () => {
      this._validateUrl(url, 'download')
      
      try {
        // POBIERZ INFO O TRACKU
        const info = await this.getInfo(url)
        
        // ODRZUĆ SAMPLE ~30s (+/- 0.6s) I OGRANICZENIA REGIONALNE
        if (
          typeof info.duration === 'number' &&
          info.duration >= 29500 &&
          info.duration <= 30500
        ) {
          throw new SCDLError(
            'Ten utwór to najprawdopodobniej 30-sekundowy sample/prewka SoundCloud!',
            SCDLErrorType.SAMPLE_TRACK,
            undefined,
            url
          )
        }
        
        if ('region_restricted' in info && info.region_restricted === true) {
          throw new SCDLError(
            'Ten utwór jest niedostępny w Twoim regionie!',
            SCDLErrorType.REGION_RESTRICTED,
            undefined,
            url
          )
        }
        
        if (info.streamable !== true) {
          throw new SCDLError(
            'Nie można streamować tego utworu!',
            SCDLErrorType.NOT_STREAMABLE,
            undefined,
            url
          )
        }
        
        // Jeśli przeszedł checki, pobieraj!
        const preparedUrl = await this.prepareURL(url)
        return download(preparedUrl, await this.getClientID(), this.axios, useDirectLink)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania utworu: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   *  Get the audio of a given track with the specified format
   * @param url - The URL of the Soundcloud track
   * @param format - The desired format
  */
  async downloadFormat (url: string, format: FORMATS) {
    return this._withRetry(async () => {
      this._validateUrl(url, 'downloadFormat')
      
      try {
        const preparedUrl = await this.prepareURL(url)
        return downloadFormat(preparedUrl, await this.getClientID(), format, this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania formatu ${format}: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   * Returns info about a given track.
   * @param url - URL of the Soundcloud track
   * @returns Info about the track
  */
  async getInfo (url: string) {
    return this._withRetry(async () => {
      this._validateUrl(url, 'getInfo')
      
      try {
        const preparedUrl = await this.prepareURL(url)
        return getInfo(preparedUrl, await this.getClientID(), this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania informacji o utworze: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   * Returns info about the given track(s) specified by ID.
   * @param ids - The ID(s) of the tracks
   * @returns Info about the track
   */
  async getTrackInfoByID (ids: number[], playlistID?: number, playlistSecretToken?: string) {
    return this._withRetry(async () => {
      try {
        if (!Array.isArray(ids) || ids.length === 0) {
          throw new SCDLError(
            'IDs muszą być niepustą tablicą liczb.',
            SCDLErrorType.INVALID_URL
          )
        }

        return getTrackInfoByID(await this.getClientID(), this.axios, ids, playlistID, playlistSecretToken)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania informacji o utworach po ID: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error
        )
      }
    })
  }

  /**
   * Returns info about the given set
   * @param url - URL of the Soundcloud set
   * @returns Info about the set
   */
  async getSetInfo (url: string) {
    return this._withRetry(async () => {
      this._validateUrl(url, 'getSetInfo')
      
      try {
        const preparedUrl = await this.prepareURL(url)
        return getSetInfo(preparedUrl, await this.getClientID(), this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania informacji o secie: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   * Searches for tracks/playlists for the given query
   * @param options - The search option
   * @returns SearchResponse
   */
  async search (options: SearchOptions) {
    return this._withRetry(async () => {
      try {
        if (!options || (!options.q && !options.query)) {
          throw new SCDLError(
            'Opcje wyszukiwania muszą zawierać query (q) lub query.',
            SCDLErrorType.INVALID_URL
          )
        }

        return search(options, this.axios, await this.getClientID())
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas wyszukiwania: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error
        )
      }
    })
  }

  /**
   * Finds related tracks to the given track specified by ID
   * @param id - The ID of the track
   * @param limit - The number of results to return
   * @param offset - Used for pagination, set to 0 if you will not use this feature.
   */
  async related (id: number, limit: number, offset = 0) {
    return this._withRetry(async () => {
      try {
        if (!Number.isInteger(id) || id <= 0) {
          throw new SCDLError(
            'ID musi być dodatnią liczbą całkowitą.',
            SCDLErrorType.INVALID_URL
          )
        }

        if (!Number.isInteger(limit) || limit <= 0) {
          throw new SCDLError(
            'Limit musi być dodatnią liczbą całkowitą.',
            SCDLErrorType.INVALID_URL
          )
        }

        return related(id, limit, offset, this.axios, await this.getClientID())
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania powiązanych utworów: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error
        )
      }
    })
  }

  /**
   * Returns the audio streams and titles of the tracks in the given playlist.
   * @param url - The url of the playlist
   */
  async downloadPlaylist (url: string): Promise<[ReadableStream<any>[], String[]]> {
    return this._withRetry(async () => {
      this._validateUrl(url, 'downloadPlaylist')
      
      try {
        if (!this.isPlaylistURL(url)) {
          throw new SCDLError(
            'URL nie jest prawidłowym linkiem do playlisty SoundCloud.',
            SCDLErrorType.INVALID_URL,
            undefined,
            url
          )
        }

        const preparedUrl = await this.prepareURL(url)
        return downloadPlaylist(preparedUrl, await this.getClientID(), this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania playlisty: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   * Returns track information for a user's likes
   * @param options - Can either be the profile URL of the user, or their ID
   * @returns - An array of tracks
   */
  async getLikes (options: GetLikesOptions): Promise<PaginatedQuery<Like>> {
    return this._withRetry(async () => {
      try {
        let id: number
        const clientID = await this.getClientID()
        
        if (options.id) {
          id = options.id
        } else if (options.profileUrl) {
          this._validateUrl(options.profileUrl, 'getLikes')
          const user = await getUser(await this.prepareURL(options.profileUrl), clientID, this.axios)
          id = user.id
        } else if (options.nextHref) {
          return await getLikes(options, clientID, this.axios)
        } else {
          throw new SCDLError(
            'options.id lub options.profileURL musi być podane.',
            SCDLErrorType.INVALID_URL
          )
        }
        
        options.id = id
        return getLikes(options, clientID, this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania polubień: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error
        )
      }
    })
  }

  /**
   * Returns information about a user
   * @param url - The profile URL of the user
   */
  async getUser (url: string): Promise<User> {
    return this._withRetry(async () => {
      this._validateUrl(url, 'getUser')
      
      try {
        const preparedUrl = await this.prepareURL(url)
        return getUser(preparedUrl, await this.getClientID(), this.axios)
      } catch (error) {
        if (error instanceof SCDLError) throw error
        throw new SCDLError(
          `Błąd podczas pobierania informacji o użytkowniku: ${error.message}`,
          SCDLErrorType.NETWORK_ERROR,
          error as Error,
          url
        )
      }
    })
  }

  /**
   * Sets the instance of Axios to use to make requests to SoundCloud API
   * @param instance - An instance of Axios
   */
  setAxiosInstance (instance: AxiosInstance) {
    this.axios = instance
    this._setupAxiosInterceptors()
  }

  /**
   * Returns whether or not the given URL is a valid Soundcloud URL
   * @param url - URL of the Soundcloud track
  */
  isValidUrl (url: string) {
    try {
      return isValidURL(url, this.convertFirebaseLinks, this.stripMobilePrefix)
    } catch (error) {
      return false
    }
  }

  /**
   * Returns whether or not the given URL is a valid playlist SoundCloud URL
   * @param url - The URL to check
   */
  isPlaylistURL (url: string) {
    try {
      return isPlaylistURL(url)
    } catch (error) {
      return false
    }
  }

  /**
   * Returns true if the given URL is a personalized track URL. (of the form https://soundcloud.com/discover/sets/personalized-tracks::user-sdlkfjsldfljs:847104873)
   * @param url - The URL to check
   */
  isPersonalizedTrackURL (url: string) {
    try {
      return isPersonalizedTrackURL(url)
    } catch (error) {
      return false
    }
  }

  /**
   * Returns true if the given URL is a Firebase URL (of the form https://soundcloud.app.goo.gl/XXXXXXXX)
   * @param url - The URL to check
   */
  isFirebaseURL (url: string) {
    try {
      return isFirebaseURL(url)
    } catch (error) {
      return false
    }
  }

  async getClientID (): Promise<string> {
    try {
      if (!this._clientID) {
        await this.setClientID()
      }

      if (!this._clientID) {
        throw new SCDLError(
          'Nie można pobrać Client ID.',
          SCDLErrorType.CLIENT_ID_ERROR
        )
      }

      return this._clientID
    } catch (error) {
      if (error instanceof SCDLError) throw error
      throw new SCDLError(
        `Błąd podczas pobierania Client ID: ${error.message}`,
        SCDLErrorType.CLIENT_ID_ERROR,
        error as Error
      )
    }
  }

  /** @internal */
  async setClientID (clientID?: string): Promise<string> {
    try {
      if (!clientID) {
        if (!this._clientID) {
          if (this.saveClientID) {
            const filename = path.resolve(__dirname, this._filePath ? this._filePath : '../client_id.json')
            const c = await this._getClientIDFromFile(filename)
            if (!c) {
              this._clientID = await sckey.fetchKey()
              const data = {
                clientID: this._clientID,
                date: new Date().toISOString()
              }
              
              try {
                await fs.promises.writeFile(filename, JSON.stringify(data))
              } catch (err) {
                console.warn('Nie można zapisać client_id do pliku: ' + err)
              }
            } else {
              this._clientID = c
            }
          } else {
            this._clientID = await sckey.fetchKey()
          }
        }

        return this._clientID
      }

      this._clientID = clientID
      return clientID
    } catch (error) {
      throw new SCDLError(
        `Błąd podczas ustawiania Client ID: ${error.message}`,
        SCDLErrorType.CLIENT_ID_ERROR,
        error as Error
      )
    }
  }

  /** @internal */
  private async _getClientIDFromFile (filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(filename)) return resolve('')

      fs.readFile(filename, 'utf8', (err: NodeJS.ErrnoException, data: string) => {
        if (err) return reject(new SCDLError(
          `Błąd czytania pliku client_id.json: ${err.message}`,
          SCDLErrorType.FILE_SYSTEM_ERROR,
          err
        ))
        
        let c: ClientIDData
        try {
          c = JSON.parse(data)
        } catch (parseErr) {
          return reject(new SCDLError(
            'Błąd parsowania client_id.json',
            SCDLErrorType.PARSING_ERROR,
            parseErr as Error
          ))
        }
        
        if (!c.date || !c.clientID) {
          return reject(new SCDLError(
            "Brakuje właściwości 'date' lub 'clientID' w client_id.json",
            SCDLErrorType.PARSING_ERROR
          ))
        }
        
        if (typeof c.clientID !== 'string') {
          return reject(new SCDLError(
            "Właściwość 'clientID' nie jest stringiem w client_id.json",
            SCDLErrorType.PARSING_ERROR
          ))
        }
        
        if (typeof c.date !== 'string') {
          return reject(new SCDLError(
            "Właściwość 'date' nie jest stringiem w client_id.json",
            SCDLErrorType.PARSING_ERROR
          ))
        }
        
        const d = new Date(c.date)
        if (Number.isNaN(d.getTime())) {
          return reject(new SCDLError(
            "Nieprawidłowy obiekt daty z 'date' w client_id.json",
            SCDLErrorType.PARSING_ERROR
          ))
        }
        
        const dayMs = 60 * 60 * 24 * 1000
        if (new Date().getTime() - d.getTime() >= dayMs) {
          // Starszy niż dzień, usuń
          fs.unlink(filename, err => {
            if (err) console.warn('Nie można usunąć client_id.json: ' + err)
          })
          return resolve('')
        } else {
          return resolve(c.clientID)
        }
      })
    })
  }

  /**
   * Prepares the given URL by stripping its mobile prefix (if this.stripMobilePrefix is true)
   * and converting it to a regular URL (if this.convertFireBaseLinks is true.)
   * @param url
   */
  async prepareURL (url: string): Promise<string> {
    try {
      let processedUrl = url
      
      if (this.stripMobilePrefix) {
        processedUrl = stripMobilePrefix(processedUrl)
      }
      
      if (this.convertFirebaseLinks && isFirebaseURL(processedUrl)) {
        processedUrl = await convertFirebaseURL(processedUrl, this.axios)
      }

      return processedUrl
    } catch (error) {
      throw new SCDLError(
        `Błąd podczas przygotowywania URL: ${error.message}`,
        SCDLErrorType.INVALID_URL,
        error as Error,
        url
      )
    }
  }

  /**
   * Sprawdza czy błąd można ponowić
   */
  isRetryableError(error: SCDLError): boolean {
    return ![
      SCDLErrorType.INVALID_URL,
      SCDLErrorType.REGION_RESTRICTED,
      SCDLErrorType.NOT_STREAMABLE,
      SCDLErrorType.SAMPLE_TRACK,
      SCDLErrorType.FORMAT_NOT_FOUND
    ].includes(error.type)
  }

  /**
   * Czyści cache client ID (zmusza do ponownego pobrania)
   */
  clearClientID(): void {
    this._clientID = undefined
  }

  /**
   * Sprawdza status połączenia z SoundCloud API
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error', clientID?: string, error?: string }> {
    try {
      const clientID = await this.getClientID()
      
      // Prosta próba zapytania do API
      const testUrl = 'https://soundcloud.com/mt-eden/still-alive'
      await this.getInfo(testUrl)
      
      return { 
        status: 'ok', 
        clientID: clientID.substring(0, 8) + '...' // Pokaż tylko początek dla bezpieczeństwa
      }
    } catch (error) {
      return { 
        status: 'error', 
        error: error instanceof SCDLError ? error.message : error.message 
      }
    }
  }

  /**
   * Ustawia opcje retry dla instancji
   */
  setRetryOptions(maxRetries: number, retryDelay: number): void {
    if (!Number.isInteger(maxRetries) || maxRetries < 0) {
      throw new SCDLError(
        'maxRetries musi być nieujemną liczbą całkowitą.',
        SCDLErrorType.INVALID_URL
      )
    }
    
    if (!Number.isInteger(retryDelay) || retryDelay < 0) {
      throw new SCDLError(
        'retryDelay musi być nieujemną liczbą całkowitą.',
        SCDLErrorType.INVALID_URL
      )
    }

    this._maxRetries = maxRetries
    this._retryDelay = retryDelay
  }

  /**
   * Pobiera obecne ustawienia retry
   */
  getRetryOptions(): { maxRetries: number, retryDelay: number } {
    return {
      maxRetries: this._maxRetries,
      retryDelay: this._retryDelay
    }
  }

  /**
   * Ustawia timeout dla żądań
   */
  setTimeout(timeout: number): void {
    if (!Number.isInteger(timeout) || timeout <= 0) {
      throw new SCDLError(
        'Timeout musi być dodatnią liczbą całkowitą.',
        SCDLErrorType.INVALID_URL
      )
    }

    this._timeout = timeout
    this.axios.defaults.timeout = timeout
  }

  /**
   * Pobiera obecny timeout
   */
  getTimeout(): number {
    return this._timeout
  }

  /**
   * Włącza/wyłącza walidację URL
   */
  setUrlValidation(validate: boolean): void {
    this._validateUrls = validate
  }

  /**
   * Sprawdza czy walidacja URL jest włączona
   */
  isUrlValidationEnabled(): boolean {
    return this._validateUrls
  }
}

// SCDL instance with default configuration
const scdl = new SCDL()

// Creates an instance of SCDL with custom configuration
const create = (options: SCDLOptions): SCDL => new SCDL(options)

export { create, SCDLErrorType }

scdl.STREAMING_PROTOCOLS = _PROTOCOLS
scdl.FORMATS = _FORMATS

export default scdl
