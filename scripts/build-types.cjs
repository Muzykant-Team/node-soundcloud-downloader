#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { copyFileSync, readdirSync } = require('node:fs')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')

function runTsdown(args) {
  const candidates = [
    `pnpm exec tsdown ${args}`,
    `npx -y tsdown@latest ${args}`,
    `${path.join(repoRoot, 'node_modules', '.bin', 'tsdown')} ${args}`
  ]

  for (const cmd of candidates) {
    try {
      execSync(cmd, { cwd: repoRoot, stdio: 'inherit', shell: true })
      return
    } catch (err) {
      // try next candidate
    }
  }

  console.error('Failed to execute tsdown via pnpm, npx, or local bin')
  process.exit(1)
}

runTsdown('src/index.ts --dts --format esm --clean false --out-dir dist')

const typeFile = readdirSync(distDir)
  .filter((file) => /^index-.*\.d\.ts$/.test(file))
  .sort()
  .at(-1)

if (!typeFile) {
  console.error('Failed to locate generated declaration file in dist/')
  process.exit(1)
}

copyFileSync(path.join(distDir, typeFile), path.join(repoRoot, 'index.d.ts'))
console.log(`Copied dist/${typeFile} -> index.d.ts`)
