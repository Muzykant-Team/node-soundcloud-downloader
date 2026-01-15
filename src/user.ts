import { AxiosInstance } from 'axios'
import type { User } from './info'
import { appendURL, resolveURL } from './util'

/** @internal */
export const getUser = async (
  url: string,
  clientID: string,
  axiosInstance: AxiosInstance
): Promise<User> => {
  // Tworzymy poprawny URL z parametrami query
  const fullURL = appendURL(resolveURL, 'url', url, 'client_id', clientID)

  // Pobranie danych
  const response = await axiosInstance.get<User>(fullURL)

  // Walidacja odpowiedzi
  if (!response.data?.avatar_url) {
    throw new Error(`JSON response is not a user. Is profile URL correct? : ${url}`)
  }

  return response.data
}
