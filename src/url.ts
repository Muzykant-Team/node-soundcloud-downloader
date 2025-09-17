import type { AxiosInstance } from 'axios'

const SOUNDCLOUD_REGEX = /^https?:\/\/(soundcloud\.com)\/(.*)$/
const MOBILE_URL_REGEX = /^https?:\/\/(m\.soundcloud\.com)\/(.*)$/
const FIREBASE_URL_REGEX = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/
const FIREBASE_CONTENT_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,500}\.[a-zA-Z0-9()]{1,500}\b([-a-zA-Z0-9()@:%_+.~#?&//\\=]*)/g

const isURL = (url: string, testMobile = false, testFirebase = false) => {
  if (testMobile && MOBILE_URL_REGEX.test(url)) {
    return !!(url.match(SOUNDCLOUD_REGEX)?.[2])
  }
  
  if (testFirebase && FIREBASE_URL_REGEX.test(url)) {
    return !!(url.match(FIREBASE_CONTENT_REGEX)?.[2])
  }
  
  if (SOUNDCLOUD_REGEX.test(url)) {
    return !!(url.match(SOUNDCLOUD_REGEX)?.[2])
  }
  
  return false
}

export const isPlaylistURL = (url: string) => {
  if (!isURL(url)) return false
  try {
    return new URL(url).pathname.includes('/sets/')
  } catch {
    return false
  }
}

export const isPersonalizedTrackURL = (url: string) => {
  return isURL(url) && url.includes('https://soundcloud.com/discover/sets/personalized-tracks::')
}

export const stripMobilePrefix = (url: string) => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname !== 'm.soundcloud.com') return url
    urlObj.hostname = 'soundcloud.com'
    return urlObj.toString()
  } catch {
    return url
  }
}

export const isFirebaseURL = (url: string) => {
  try {
    return new URL(url).hostname === 'soundcloud.app.goo.gl'
  } catch {
    return false
  }
}

export const convertFirebaseURL = async (url: string, axiosInstance: AxiosInstance) => {
  const urlObj = new URL(url)
  urlObj.searchParams.set('d', '1')
  
  const { data }: { data: string } = await axiosInstance.get(urlObj.toString())
  const matches = data.match(FIREBASE_CONTENT_REGEX)
  
  if (!matches) {
    throw new Error(`Could not find URL for this SoundCloud Firebase URL: ${url}`)
  }
  
  const firebaseURL = matches.find(match => SOUNDCLOUD_REGEX.test(match))
  if (!firebaseURL) return undefined
  
  return firebaseURL.replace(/\\u([\d\w]{4})/gi, (_, group) => 
    String.fromCharCode(parseInt(group, 16))
  )
}

export default isURL
