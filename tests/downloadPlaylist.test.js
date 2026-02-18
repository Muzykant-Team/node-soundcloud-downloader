/**
 * @jest-environment node
 */
const scdl = require('..').default

let streams
let trackNames

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('downloadPlaylist()', () => {
  let fileType
  beforeAll(async () => {
    ;({ fileType } = await import('file-type'))
    try {
      const [s, t] = await scdl.downloadPlaylist('https://soundcloud.com/zack-radisic-103764335/sets/test')
      streams = s
      trackNames = t
    } catch (err) {
      console.log(err)
    }
  })

  it('streams are defined', () => {
    streams.forEach(stream => expect(stream).toBeDefined())
  })

  it('stream mime type is mpeg', async () => {
    try {
      for (const stream of streams) {
        const type = await fileType.fromStream(stream)
        expect(type).toBeDefined()
        expect(type.mime).toBe('audio/mpeg')
      }
      
    } catch (err) {
      console.log(err)
      throw err
    }
  })

  it('Track names are defined and are of type string', () => {
    trackNames.forEach(trackName => {
      expect(trackName).toBeDefined()
      expect(typeof trackName).toBe('string')
    })
  })

  it('No Errors in Stream', () => {
    streams.forEach(stream => stream.on('error', (err) => {
      expect(err).toBeFalsy()
    }))
  })
})
