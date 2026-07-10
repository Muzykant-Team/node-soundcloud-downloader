import { defineConfig } from 'tsdown'

const config = [
  {
    entry: ['./src/index.ts'],
    outDir: 'dist',
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    minify: true,
    clean: true
  },
  {
    entry: ['./src/download.ts', './src/info.ts', './src/filter-media.ts', './src/formats.ts', './src/protocols.ts'],
    outDir: 'dist',
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    minify: true,
    clean: false
  }
]

// Some versions of `tsdown` export a `defineConfig` helper. If the API changes
// (breaking changes in newer tsdown releases), fall back to exporting the raw
// config array so older/newer CLIs can still consume it.
const exported = typeof defineConfig === 'function' ? defineConfig(config as any) : config

export default exported
