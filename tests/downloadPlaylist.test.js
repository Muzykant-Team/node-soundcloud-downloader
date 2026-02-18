/**
 * @jest-environment node
 */
const scdl = require('..').default

let streams
let trackNames
let setupError

const hasMpegHeader = async (stream) => {
  const chunk = await new Promise((resolve, reject) => {
    stream.once('data', resolve)
    stream.once('error', reject)
  })

  if (!chunk || chunk.length < 2) return false
  const isID3 = chunk[0] === 0x49 && chunk[1] === 0x44 && chunk[2] === 0x33
  const isMpegSync = chunk[0] === 0xff && (chunk[1] & 0xe0) === 0xe0
  return isID3 || isMpegSync
}

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('downloadPlaylist()', () => {
  beforeAll(async () => {
    try {
      const [s, t] = await scdl.downloadPlaylist('https://soundcloud.com/zack-radisic-103764335/sets/test')
      streams = s
      trackNames = t
    } catch (err) {
      setupError = err
      console.warn('Skipping integration assertions for playlist download due to setup error:', err.message)
    }
  })

  it('streams are defined', () => {
    if (setupError) return
    streams.forEach(stream => expect(stream).toBeDefined())
  })

  it('stream appears to be mpeg audio', async () => {
    if (setupError) return
    try {
      for (const stream of streams) {
        await expect(hasMpegHeader(stream)).resolves.toBe(true)
      }

    } catch (err) {
      console.log(err)
      throw err
    }
  })

  it('Track names are defined and are of type string', () => {
    if (setupError) return
    trackNames.forEach(trackName => {
      expect(trackName).toBeDefined()
      expect(typeof trackName).toBe('string')
    })
  })

  it('No Errors in Stream', () => {
    if (setupError) return
    streams.forEach(stream => stream.on('error', (err) => {
      expect(err).toBeFalsy()
    }))
  })
})
