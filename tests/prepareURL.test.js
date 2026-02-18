/**
 * @jest-environment node
 */

import scdl from '../'

const itIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? it : it.skip

describe('prepareURL()', () => {
  it('strips a mobile URL of its prefix', async () => {
    const url = 'https://m.soundcloud.com/sidewalksandskeletons/ic3peak-ill-be-found-sidewalks-and-skeletons-remix'
    const expected = 'https://soundcloud.com/sidewalksandskeletons/ic3peak-ill-be-found-sidewalks-and-skeletons-remix'

    try {
      const result = await scdl.prepareURL(url)
      expect(result).toEqual(expected)
      
    } catch (err) {
      throw err
    }
  })

  itIntegration('converts a Firebase URL to a regular URL', async () => {
    const url = 'https://soundcloud.app.goo.gl/z8snjNyHU8zMHH29A'
    const expected = 'https://soundcloud.com/taliya-jenkins/double-cheese-burger-hold-the?ref=clipboard&p=i&c=0'

    try {
      const result = await scdl.prepareURL(url)
      expect(result.toString()).toEqual(expected)
      
    } catch (err) {
      throw err
    }
  })

  it('returns the original string if it is not a mobile or Firebase URL', async () => {
    const url = 'https://soundcloud.com/taliya-jenkins/double-cheese-burger-hold-the?ref=clipboard&p=i&c=0'
    try {
      const result = await scdl.prepareURL(url)
      expect(result).toEqual(url)
      
    } catch (err) {
      throw err
    }
  })
})
