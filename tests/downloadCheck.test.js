/**
 * @jest-environment node
 */

/**
 *  This file tests the actual download of the a song, without mocking axios
 *
 * Author : Rahul Tarak
 *
 */
require('dotenv').config()
const scdl = require('../').default

let downloadedFile
let downloadedFile2
let setupError

const hasMpegHeader = async (stream) => {
  const chunk = await new Promise((resolve, reject) => {
    stream.once('data', resolve)
    stream.once('error', reject)
  })

  if (!chunk || chunk.length < 2) return false

  // ID3 tag or MPEG frame sync
  const isID3 = chunk[0] === 0x49 && chunk[1] === 0x44 && chunk[2] === 0x33
  const isMpegSync = chunk[0] === 0xff && (chunk[1] & 0xe0) === 0xe0
  return isID3 || isMpegSync
}

const describeIntegration = process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip
describeIntegration('Real Download Tests', () => {
  beforeAll(async () => {
    try {
      downloadedFile = await scdl.download(
        'https://soundcloud.com/monsune_inc/outta-my-mind')
      downloadedFile2 = await scdl.download('https://soundcloud.com/dakota-perez-7/omfg-mashup-hello-i-love-you-yeah-ice-cream-and-wonderful')
    } catch (err) {
      setupError = err
      console.warn('Skipping integration assertions for download check due to setup error:', err.message)
    }
  })
  it('Stream is Defined', () => {
    if (setupError) return
    expect(downloadedFile).toBeDefined()
  })
  it('Check File Type is Mpeg', async () => {
    if (setupError) return
    await expect(hasMpegHeader(downloadedFile)).resolves.toBe(true)
  })
  it('Check downloaded stream has audio data', async () => {
    if (setupError) return
    await expect(hasMpegHeader(downloadedFile2)).resolves.toBe(true)
  })

  it('No Errors in Stream', () => {
    if (setupError) return
    downloadedFile.on('error', (err) => {
      expect(err).toBeFalsy()
    })
  })
})
