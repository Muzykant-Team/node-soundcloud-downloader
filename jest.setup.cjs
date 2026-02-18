const { fetchKey, testKey } = require('soundcloud-key-fetch')

jest.setTimeout(60 * 1000)

beforeAll(async () => {
  const integrationEnabled = process.env.RUN_INTEGRATION_TESTS === 'true'

  if (!integrationEnabled) {
    return
  }

  if (process.env.CLIENT_ID) {
    const isValid = await testKey(process.env.CLIENT_ID).catch(() => false)
    if (isValid) {
      return
    }
  }

  const generatedClientID = await fetchKey()

  if (!generatedClientID) {
    throw new Error('Nie udało się wygenerować CLIENT_ID dla testów integracyjnych SoundCloud.')
  }

  process.env.CLIENT_ID = generatedClientID
})
