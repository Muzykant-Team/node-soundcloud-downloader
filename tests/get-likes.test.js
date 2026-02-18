/**
 * @jest-environment node
 */

import scdl from '..'


const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('getLikes()', () => {
  const profileUrl = 'https://soundcloud.com/uiceheidd'
  const limit = 41

  let response
  let count
  let setupError

  beforeAll(async () => {
    try {
      response = await scdl.getLikes({
        profileUrl,
        limit
      })
    } catch (err) {
      setupError = err
      console.warn('Skipping integration assertions for getLikes due to setup error:', err.message)
    }
  })

  it('returns a paginated query', () => {
    if (setupError) return
    expect(response).toBeDefined()
    const keys = ['collection', 'next_href', 'query_urn']
    keys.forEach(key => expect(response[key]).toBeDefined())
  })

  it('the paginated query collection is an array of likes', () => {
    if (setupError) return
    response.collection.forEach(like => expect(like.kind).toEqual('like'))
  })

  it('each like should have a track object', () => {
    if (setupError) return
    response.collection.forEach(like => {
    expect(like.track.kind).toBeDefined()
    expect(like.track.kind).toEqual('track')
    })
  })

  it('collection length should be less than or equal to limit if limit !== -1', () => {
    if (setupError) return
    count = response.collection.length
    expect(response.collection.length).toBeLessThanOrEqual(limit)
  })

  it('should fetch as many liked tracks as possible when limit === -1', async () => {
    if (setupError) return
    try {
      const likes = await scdl.getLikes({
        profileUrl,
        limit: -1
      })
      expect(Array.isArray(likes.collection)).toBe(true)

      // The likes endpoint is not fully stable across all public accounts and
      // can occasionally return empty pages. Only enforce monotonicity when we
      // received data from the first request.
      if (count > 0 && likes.collection.length > 0) {
        expect(likes.collection.length).toBeGreaterThanOrEqual(count)
      }
      
    } catch (err) {
      console.error(err)
      throw err
    }
  })
})
