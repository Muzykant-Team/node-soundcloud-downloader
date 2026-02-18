#!/usr/bin/env node
const { fetchKey, testKey } = require('soundcloud-key-fetch')

async function main() {
  const maxAttempts = Number(process.env.SCDL_CLIENT_ID_ATTEMPTS || 3)

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const clientID = await fetchKey()
      if (!clientID) throw new Error('Empty client ID')

      const isValid = await testKey(clientID).catch(() => false)
      if (!isValid) throw new Error('Fetched client ID is not valid')

      process.stdout.write(clientID)
      return
    } catch (err) {
      if (attempt === maxAttempts) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`Failed to generate SoundCloud client ID after ${maxAttempts} attempts: ${message}`)
        process.exit(1)
      }
    }
  }
}

main()
