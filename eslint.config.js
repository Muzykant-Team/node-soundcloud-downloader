import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';

const globals = {
  Buffer: 'readonly',
  console: 'readonly',
  process: 'readonly',
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  URL: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  jest: 'readonly',
  xdescribe: 'readonly',
  xit: 'readonly',
  fit: 'readonly',
  fdescribe: 'readonly'
};

export default defineConfig({
  ignores: ['dist/**', 'node_modules/**', 'docs/**'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    globals
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    jest: jestPlugin
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  },
  linterOptions: {
    reportUnusedDisableDirectives: true
  }
});
