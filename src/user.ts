import axios from 'axios'
import type { AxiosInstance } from 'axios' // tylko dla TS
import type { User } from './info'
import { appendURL, resolveURL } from './util'

/** @internal */
export const getUser = async (
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<User> => {
  const fullURL = appendURL(resolveURL, 'url', url, 'client_id', clientID)
  const response = await axiosInstance.get<User>(fullURL)

  if (!response.data?.avatar_url) {
    throw new Error(`JSON response is not a user. Is profile URL correct? : ${url}`)
  }

  return response.data
}
