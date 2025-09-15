/**
 * Tests for package-lock.json integrity focused on the PR diff.
 * Testing library/framework: Jest v30 (as declared in devDependencies).
 *
 * These tests validate:
 * - Root package metadata (name, version, license)
 * - Engines constraint (node >= 20.9.0)
 * - Root deps/devDeps ranges for selected critical packages
 * - Installed Jest packages (jest, jest-cli, jest-config) versions and key metadata
 */
const fs = require('fs');
const path = require('path');

const lockPath = path.resolve(__dirname, '..', 'package-lock.json');

function loadLock() {
  const raw = fs.readFileSync(lockPath, 'utf8');
  const json = JSON.parse(raw);
  return json;
}

function getPackagesContainer(lock) {
  // npm lockfile v2/v3 place entries under "packages".
  // Fallback to top-level keys if "packages" is absent.
  return lock && lock.packages && typeof lock.packages === 'object' ? lock.packages : lock;
}

function getRoot(lock) {
  const P = getPackagesContainer(lock);
  return (P && P['']) || {};
}

function getPkg(lock, shortName) {
  const P = getPackagesContainer(lock);
  const key = `node_modules/${shortName}`;
  return P ? P[key] : undefined;
}

describe('package-lock.json integrity (focused on diff changes)', () => {
  let lock;
  let root;

  beforeAll(() => {
    lock = loadLock();
    root = getRoot(lock);
  });

  test('parses as valid JSON and exposes expected structure', () => {
    expect(lock).toBeTruthy();
    // Must have either "packages" map or the legacy top-level key structure
    expect(
      (lock && typeof lock === 'object' && 'packages' in lock) ||
        (lock && typeof lock === 'object' && '' in lock)
    ).toBe(true);
  });

  test('root metadata: name, version, license', () => {
    expect(root).toEqual(
      expect.objectContaining({
        name: 'soundcloud-downloader',
        version: '2.0.0',
        license: 'MIT',
      })
    );
  });

  test('root engines.node requires >= 20.9.0', () => {
    expect(root.engines).toBeDefined();
    expect(root.engines).toEqual(
      expect.objectContaining({
        node: '>=20.9.0',
      })
    );
  });

  test('root dependencies include critical runtime deps with expected ranges', () => {
    const deps = root.dependencies || {};
    expect(deps).toEqual(
      expect.objectContaining({
        '@babel/runtime': '^7.28.4',
        axios: '^1.12.1',
        dotenv: '^17.2.2',
        m3u8stream: '^0.8.6',
        'soundcloud-key-fetch': '^1.0.13',
      })
    );
  });

  test('root devDependencies include key tooling with expected ranges (including Jest v30)', () => {
    const dev = root.devDependencies || {};
    expect(dev).toEqual(
      expect.objectContaining({
        jest: '^30.1.3',
        eslint: '^9.35.0',
        '@typescript-eslint/eslint-plugin': '^8.43.0',
        '@typescript-eslint/parser': '^8.43.0',
        'axios-mock-adapter': '^2.1.0',
        'music-metadata': '^11.8.3',
        typescript: '^5.9.2',
      })
    );
  });

  test('jest is installed at 30.1.3 with correct engines and peer deps', () => {
    const jestPkg = getPkg(lock, 'jest');
    expect(jestPkg).toBeDefined();
    expect(jestPkg.version).toBe('30.1.3');

    // engines.node
    expect(jestPkg.engines).toBeDefined();
    expect(jestPkg.engines).toEqual(
      expect.objectContaining({
        node: '^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0',
      })
    );

    // peerDependencies / peerDependenciesMeta
    expect(jestPkg.peerDependencies).toEqual(
      expect.objectContaining({
        'node-notifier': '^8.0.1 || ^9.0.0 || ^10.0.0',
      })
    );
    const meta =
      jestPkg.peerDependenciesMeta && jestPkg.peerDependenciesMeta['node-notifier'];
    expect(meta && meta.optional).toBe(true);

    // binary exposure
    expect(jestPkg.bin && jestPkg.bin.jest).toBe('bin/jest.js');
  });

  test('jest-cli is installed at 30.1.3 with correct deps and bin', () => {
    const jestCli = getPkg(lock, 'jest-cli');
    expect(jestCli).toBeDefined();
    expect(jestCli.version).toBe('30.1.3');

    // Selected dependencies that reflect the diff
    expect(jestCli.dependencies).toEqual(
      expect.objectContaining({
        '@jest/core': '30.1.3',
        'jest-config': '30.1.3',
        'jest-util': '30.0.5',
      })
    );

    // Binary exposure
    expect(jestCli.bin && jestCli.bin.jest).toBe('bin/jest.js');

    // engines
    expect(jestCli.engines).toEqual(
      expect.objectContaining({
        node: '^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0',
      })
    );
  });

  test('jest-config is installed at 30.1.3 with expected dependency pins', () => {
    const jestConfig = getPkg(lock, 'jest-config');
    expect(jestConfig).toBeDefined();
    expect(jestConfig.version).toBe('30.1.3');

    expect(jestConfig.dependencies).toEqual(
      expect.objectContaining({
        'babel-jest': '30.1.2',
        'jest-circus': '30.1.3',
        'jest-environment-node': '30.1.2',
      })
    );

    // engines
    expect(jestConfig.engines).toEqual(
      expect.objectContaining({
        node: '^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0',
      })
    );
  });
});