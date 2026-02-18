/**
 * @jest-environment node
 */
import scdl from '../'


const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('getTrackInfoByID()', () => {
  it('returns track info when given a valid url', async () => {
    try {
      const info = await scdl.getTrackInfoByID([145997673, 291270539])
      expect(info[0].title).toBeDefined()
      expect(info[0].title).toEqual('Logic Ft. Big Sean - Alright (Prod. By Tae Beast)')
      
    } catch (err) {
      console.error(err)
      throw err
    }
  })
})
