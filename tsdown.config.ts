import { defineConfig } from 'tsdown'

export default defineConfig([
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
])
