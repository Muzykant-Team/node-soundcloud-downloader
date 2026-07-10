import { defineConfig } from 'tsdown'
import { readdirSync } from 'node:fs'

// Pobieramy wszystkie pliki .ts z folderu src, pomijając 'index.ts', 
// ponieważ ma on swoją osobną konfigurację wyżej (z clean: true).
const srcFiles = readdirSync('./src')
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
  .map((file) => `./src/${file}`)

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
  // Dynamicznie budujemy wszystkie pozostałe moduły z src,
  // tak jak oczekują tego testy (produkując dist/info, dist/download, itd.)
  ...srcFiles.map((entry) => ({
    entry: [entry],
    outDir: 'dist',
    platform: 'node',
    format: ['esm', 'cjs'],
    dts: false,
    sourcemap: true,
    minify: true,
    clean: false
  }))
]

// Some versions of `tsdown` export a `defineConfig` helper. If the API changes
// (breaking changes in newer tsdown releases), fall back to exporting the raw
// config array so older/newer CLIs can still consume it.
const exported = typeof defineConfig === 'function' ? defineConfig(config as any) : config

export default exported