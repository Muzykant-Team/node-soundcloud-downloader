#!/usr/bin/env node
const { spawnSync } = require('node:child_process')
const { copyFileSync, readdirSync } = require('node:fs')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')

// If a declaration file already exists in `dist/` (created by a prior
// `tsdown` run) prefer copying it instead of re-running the bundler — this
// prevents running the expensive build twice when `pnpm run build` already
// produced declarations.
const existingTypeFile = readdirSync(distDir)
  .filter((file) => /(^index(-.*)?|index)\.d\.(?:ts|mts)$/.test(file) || /index-.*\.d\.(?:ts|mts)$/.test(file))
  .sort()
  .at(-1)

if (existingTypeFile) {
  copyFileSync(path.join(distDir, existingTypeFile), path.join(repoRoot, 'index.d.ts'))
  console.log(`Copied dist/${existingTypeFile} -> index.d.ts`)
  process.exit(0)
}

// Fallback: run tsdown to emit declarations only when nothing was found.
try {
  const res = spawnSync('pnpm', ['exec', 'tsdown', 'src/index.ts', '--dts', '--format', 'esm', '--clean', 'false', '--out-dir', 'dist'], {
    cwd: repoRoot,
    stdio: 'inherit'
  })
  if (res.error || res.status !== 0) {
    console.error('Failed to run tsdown to generate declaration files')
    process.exit(res.status || 1)
  }
} catch (e) {
  console.error('Failed to run tsdown to generate declaration files', e && e.message)
  process.exit(1)
}

const typeFile = readdirSync(distDir)
  .filter((file) => /(^index(-.*)?|index)\.d\.(?:ts|mts)$/.test(file) || /index-.*\.d\.(?:ts|mts)$/.test(file))
  .sort()
  .at(-1)

if (!typeFile) {
  console.error('Failed to locate generated declaration file in dist/')
  process.exit(1)
}

copyFileSync(path.join(distDir, typeFile), path.join(repoRoot, 'index.d.ts'))
console.log(`Copied dist/${typeFile} -> index.d.ts`)
