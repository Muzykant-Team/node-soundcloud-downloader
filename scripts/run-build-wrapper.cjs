#!/usr/bin/env node
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..')

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: repoRoot, stdio: 'inherit', shell: true })
  if (r.error || r.status !== 0) return false
  return true
}

const candidates = [
  ['pnpm', ['exec', 'tsdown', 'src/index.ts', '--format', 'esm,cjs', '--minify', '--clean']],
  ['npx', ['-y', 'tsdown@latest', 'src/index.ts', '--format', 'esm,cjs', '--minify', '--clean']],
  [path.join(repoRoot, 'node_modules', '.bin', 'tsdown'), ['src/index.ts', '--format', 'esm,cjs', '--minify', '--clean']]
]

let ok = false
for (const [cmd, args] of candidates) {
  if (run(cmd, args)) { ok = true; break }
}

if (!ok) {
  console.error('Failed to run tsdown to build bundles (tried pnpm, npx, local bin).')
  process.exit(1)
}

// run build-types (it contains its own fallback)
const r = spawnSync('node', [path.join(repoRoot, 'scripts', 'build-types.cjs')], { cwd: repoRoot, stdio: 'inherit', shell: true })
if (r.error || r.status !== 0) process.exit(r.status || 1)

console.log('Build finished')
