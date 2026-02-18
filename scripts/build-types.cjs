#!/usr/bin/env node
const { execSync } = require('node:child_process')
const { copyFileSync, readdirSync } = require('node:fs')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')

execSync('pnpm exec tsdown src/index.ts --dts --format esm --clean false --out-dir dist', {
  cwd: repoRoot,
  stdio: 'inherit'
})

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
