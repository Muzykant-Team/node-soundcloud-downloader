/**
 * @jest-environment node
 */

import scdl from '../'


const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('search()', () => {
  it('returns a valid search object and collection length equal or less than limit and next_href pagination works', async () => {
    try {
      const query = 'borderline tame impala'
      const types = ['all', 'tracks', 'users', 'albums', 'playlists']

      for (const type of types) {
        let searchResponse = await scdl.search({
          query,
          resourceType: type,
          limit: 5
        })
        ;['collection', 'total_results', 'query_urn'].forEach(key => expect(searchResponse[key]).toBeDefined())
        expect(searchResponse.collection.length).toBeLessThanOrEqual(5)

        searchResponse = await scdl.search({
          nextHref: searchResponse.next_href
        })
        ;['collection', 'total_results', 'query_urn'].forEach(key => expect(searchResponse[key]).toBeDefined())
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  })
})
