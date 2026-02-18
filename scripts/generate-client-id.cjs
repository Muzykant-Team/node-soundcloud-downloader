#!/usr/bin/env node
const { fetchKey, testKey } = require('soundcloud-key-fetch')

function validatePositiveInteger(value, fallback, envName) {
  const parsedValue = Number(value ?? fallback)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    console.error(`Invalid ${envName} value: ${value}. Expected a positive integer.`)
    process.exit(1)
  }

  return parsedValue
}

function withTimeout(promise, timeoutMs, operationName) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  ])
}

async function main() {
  const maxAttempts = validatePositiveInteger(process.env.SCDL_CLIENT_ID_ATTEMPTS, 3, 'SCDL_CLIENT_ID_ATTEMPTS')
  const timeoutMs = validatePositiveInteger(process.env.SCDL_CLIENT_ID_TIMEOUT_MS, 15000, 'SCDL_CLIENT_ID_TIMEOUT_MS')

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const clientID = await withTimeout(fetchKey(), timeoutMs, 'fetchKey()')
      if (!clientID) throw new Error('Empty client ID')

      const isValid = await withTimeout(testKey(clientID).catch(() => false), timeoutMs, 'testKey()')
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
