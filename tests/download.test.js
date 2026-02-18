import { fromURLBase, fromMediaObjBase } from '../dist/download'

describe('Download Tests', () => {
  describe('fromURL()', () => {
    it('downloads a track using progressive protocol when given a progressive link', async () => {
      const url = 'https://api-v2.soundcloud.com/media/example/stream/progressive'
      const getMediaURLSpy = jest.fn().mockResolvedValue('https://cdn.example.com/audio.mp3')
      const getProgressiveStreamSpy = jest.fn().mockResolvedValue('stream')
      const getHLSStreamSpy = jest.fn()

      await fromURLBase(url, 'test-client-id', getMediaURLSpy, getProgressiveStreamSpy, getHLSStreamSpy, {})

      expect(getMediaURLSpy).toHaveBeenCalledWith(url, 'test-client-id', {})
      expect(getProgressiveStreamSpy).toHaveBeenCalledWith('https://cdn.example.com/audio.mp3', {})
      expect(getHLSStreamSpy).not.toHaveBeenCalled()
    })

    it('downloads a track using HLS protocol when given an HLS link', async () => {
      const url = 'https://api-v2.soundcloud.com/media/example/stream/hls'
      const getMediaURLSpy = jest.fn().mockResolvedValue('https://cdn.example.com/playlist.m3u8')
      const getProgressiveStreamSpy = jest.fn()
      const getHLSStreamSpy = jest.fn().mockReturnValue('hls-stream')

      await fromURLBase(url, 'test-client-id', getMediaURLSpy, getProgressiveStreamSpy, getHLSStreamSpy, {})

      expect(getMediaURLSpy).toHaveBeenCalledWith(url, 'test-client-id', {})
      expect(getHLSStreamSpy).toHaveBeenCalledWith('https://cdn.example.com/playlist.m3u8')
      expect(getProgressiveStreamSpy).not.toHaveBeenCalled()
    })
  })

  describe('fromMediaObj()', () => {
    it('should call fromURL() when given a valid media object', async () => {
      const mediaObj = {
        url: 'https://api-v2.soundcloud.com/media/soundcloud:tracks:673346252/stream/hls',
        preset: 'mp3_0_0',
        duration: 226031,
        snipped: false,
        format: {
          protocol: 'hls',
          mime_type: 'audio/mpeg'
        },
        quality: 'sq'
      }
      const fromURLSpy = jest.fn().mockResolvedValue('stream')

      await fromMediaObjBase(mediaObj, null, null, null, null, fromURLSpy, null)
      expect(fromURLSpy).toHaveBeenCalled()
    })

    it('should throw an error if an invalid media object is provided', async () => {
      const mediaObj = {
        sdjf: 'sfsdfsdf',
        sjdfsdf: 'kjdhksdfg'
      }
      const fromURLSpy = jest.fn()

      await expect(fromMediaObjBase(mediaObj, null, null, null, null, fromURLSpy, null)).rejects.toThrow('Invalid media object provided')
      expect(fromURLSpy).not.toHaveBeenCalled()
    })
  })
})
