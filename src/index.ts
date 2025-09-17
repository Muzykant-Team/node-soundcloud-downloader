import sckey from 'soundcloud-key-fetch'
import getInfo, { getSetInfo, type Transcoding, getTrackInfoByID, type TrackInfo, type User } from './info.js'
import filterMedia, { type FilterPredicateObject } from './filter-media.js'
import { download, fromMediaObj } from './download.js'
import isValidURL, { convertFirebaseURL, isFirebaseURL, isPersonalizedTrackURL, isPlaylistURL, stripMobilePrefix } from './url.js'
import STREAMING_PROTOCOLS, { _PROTOCOLS } from './protocols.js'
import FORMATS, { _FORMATS } from './formats.js'
import { search, related, type SoundcloudResource, type SearchOptions } from './search.js'
import { downloadPlaylist } from './download-playlist.js'
import axios, { type AxiosInstance } from 'axios'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { type PaginatedQuery } from './util.js'
import { type GetLikesOptions, getLikes, type Like } from './likes.js'
import { getUser } from './user.js'
import { fileURLToPath } from 'node:url'

interface ClientIDData {
  clientID: string
  date: string
}

export interface SCDLOptions {
  clientID?: string
  saveClientID?: boolean
  filePath?: string
  axiosInstance?: AxiosInstance
  stripMobilePrefix?: boolean
  convertFirebaseLinks?: boolean
}

const downloadFormat = async (url: string, clientID: string, format: FORMATS, axiosInstance: AxiosInstance) => {
  const info = await getInfo(url, clientID, axiosInstance)
  const filtered = filterMedia(info.media.transcodings, { format })
  if (filtered.length === 0) throw new Error(`Could not find media with specified format: (${format})`)
  return await fromMediaObj(filtered[0], clientID, axiosInstance)
}

export class SCDL {
  readonly STREAMING_PROTOCOLS = _PROTOCOLS
  readonly FORMATS = _FORMATS

  #clientID?: string
  #filePath?: string
  
  axios: AxiosInstance
  saveClientID = process.env.SAVE_CLIENT_ID?.toLowerCase() === 'true'
  stripMobilePrefix: boolean
  convertFirebaseLinks: boolean

  constructor(options: SCDLOptions = {}) {
    if (options.saveClientID) {
      this.saveClientID = options.saveClientID
      if (options.filePath) this.#filePath = options.filePath
    } else if (options.clientID) {
      this.#clientID = options.clientID
    }

    this.axios = options.axiosInstance ?? axios
    this.stripMobilePrefix = options.stripMobilePrefix ?? true
    this.convertFirebaseLinks = options.convertFirebaseLinks ?? true
  }

  filterMedia(media: Transcoding[], predicateObj: FilterPredicateObject) {
    return filterMedia(media, predicateObj)
  }

  async download(url: string, useDirectLink = true) {
    const info = await this.getInfo(url)
    
    if (typeof info.duration === 'number' && info.duration >= 29500 && info.duration <= 30500) {
      throw new Error('Ten utwór to najprawdopodobniej 30-sekundowy sample/prewka SoundCloud!')
    }
    
    if ('region_restricted' in info && info.region_restricted === true) {
      throw new Error('Ten utwór jest niedostępny w Twoim regionie!')
    }
    
    if (info.streamable !== true) {
      throw new Error('Nie można streamować tego utworu!')
    }

    return download(await this.prepareURL(url), await this.getClientID(), this.axios, useDirectLink)
  }

  async downloadFormat(url: string, format: FORMATS) {
    return downloadFormat(await this.prepareURL(url), await this.getClientID(), format, this.axios)
  }

  async getInfo(url: string) {
    return getInfo(await this.prepareURL(url), await this.getClientID(), this.axios)
  }

  async getTrackInfoByID(ids: number[], playlistID?: number, playlistSecretToken?: string) {
    return getTrackInfoByID(await this.getClientID(), this.axios, ids, playlistID, playlistSecretToken)
  }

  async getSetInfo(url: string) {
    return getSetInfo(await this.prepareURL(url), await this.getClientID(), this.axios)
  }

  async search(options: SearchOptions) {
    return search(options, this.axios, await this.getClientID())
  }

  async related(id: number, limit: number, offset = 0) {
    return related(id, limit, offset, this.axios, await this.getClientID())
  }

  async downloadPlaylist(url: string): Promise<[ReadableStream[], string[]]> {
    return downloadPlaylist(await this.prepareURL(url), await this.getClientID(), this.axios)
  }

  async getLikes(options: GetLikesOptions): Promise<PaginatedQuery<Like>> {
    const clientID = await this.getClientID()
    
    if (options.nextHref) {
      return await getLikes(options, clientID, this.axios)
    }

    let id: number
    if (options.id) {
      id = options.id
    } else if (options.profileUrl) {
      const user = await getUser(await this.prepareURL(options.profileUrl), clientID, this.axios)
      id = user.id
    } else {
      throw new Error('options.id or options.profileURL must be provided.')
    }

    return getLikes({ ...options, id }, clientID, this.axios)
  }

  async getUser(url: string): Promise<User> {
    return getUser(await this.prepareURL(url), await this.getClientID(), this.axios)
  }

  setAxiosInstance(instance: AxiosInstance) {
    this.axios = instance
  }

  isValidUrl(url: string) {
    return isValidURL(url, this.convertFirebaseLinks, this.stripMobilePrefix)
  }

  isPlaylistURL(url: string) {
    return isPlaylistURL(url)
  }

  isPersonalizedTrackURL(url: string) {
    return isPersonalizedTrackURL(url)
  }

  isFirebaseURL(url: string) {
    return isFirebaseURL(url)
  }

  async getClientID(): Promise<string> {
    if (!this.#clientID) {
      await this.#setClientID()
    }
    return this.#clientID!
  }

  async #setClientID(clientID?: string): Promise<string> {
    if (clientID) {
      this.#clientID = clientID
      return clientID
    }

    if (this.#clientID) return this.#clientID

    if (this.saveClientID) {
      const __dirname = path.dirname(fileURLToPath(import.meta.url))
      const filename = path.resolve(__dirname, this.#filePath ?? '../client_id.json')
      const cached = await this.#getClientIDFromFile(filename)
      
      if (cached) {
        this.#clientID = cached
      } else {
        this.#clientID = await sckey.fetchKey()
        const data: ClientIDData = {
          clientID: this.#clientID,
          date: new Date().toISOString()
        }
        
        try {
          await fs.promises.writeFile(filename, JSON.stringify(data))
        } catch (err) {
          console.log('Failed to save client_id to file:', err)
        }
      }
    } else {
      this.#clientID = await sckey.fetchKey()
    }

    return this.#clientID
  }

  async #getClientIDFromFile(filename: string): Promise<string> {
    try {
      if (!fs.existsSync(filename)) return ''

      const data = await fs.promises.readFile(filename, 'utf8')
      const clientData: ClientIDData = JSON.parse(data)
      
      if (!clientData.date || !clientData.clientID) {
        throw new Error("Property 'data' or 'clientID' missing from client_id.json")
      }
      
      if (typeof clientData.clientID !== 'string') {
        throw new Error("Property 'clientID' is not a string in client_id.json")
      }
      
      const date = new Date(clientData.date)
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date object from 'date' in client_id.json")
      }

      const dayMs = 24 * 60 * 60 * 1000
      if (Date.now() - date.getTime() >= dayMs) {
        try {
          await fs.promises.unlink(filename)
        } catch (err) {
          console.log('Failed to delete client_id.json:', err)
        }
        return ''
      }

      return clientData.clientID
    } catch (err) {
      console.warn('Error reading client ID file:', err)
      return ''
    }
  }

  async prepareURL(url: string): Promise<string> {
    let preparedUrl = url
    
    if (this.stripMobilePrefix) {
      preparedUrl = stripMobilePrefix(preparedUrl)
    }
    
    if (this.convertFirebaseLinks && isFirebaseURL(preparedUrl)) {
      preparedUrl = await convertFirebaseURL(preparedUrl, this.axios)
    }

    return preparedUrl
  }
}

const scdl = new SCDL()
export const create = (options: SCDLOptions): SCDL => new SCDL(options)
export default scdl
