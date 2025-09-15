/**
 * Testing library/framework: Jest v30.x (validated via package-lock.json)
 * Purpose: Validate package-lock.json integrity with special focus on the PR diff that upgraded Jest and related tooling.
 */

'use strict';

/* eslint-env jest */
const fs = require('fs');
const path = require('path');

const lockPath = path.resolve(__dirname, '..', 'package-lock.json');

describe('package-lock.json v3 - PR diff validations', () => {
  let lock;
  beforeAll(() => {
    expect(fs.existsSync(lockPath)).toBe(true);
    lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  });

  test('has lockfileVersion 3 and requires=true', () => {
    expect(lock.lockfileVersion).toBe(3);
    expect(lock.requires).toBe(true);
  });

  test('root package metadata, license, and engines', () => {
    const root = lock.packages?.[''];
    expect(root).toBeDefined();
    expect(root.name).toBe('soundcloud-downloader');
    expect(root.version).toBe('2.0.0');
    expect(root.license).toBe('MIT');
    expect(root.engines?.node).toBe('>=20.9.0');
  });

  test('root dependencies reflect expected semver ranges', () => {
    const deps = lock.packages?.['']?.dependencies || {};
    expect(deps['@babel/runtime']).toMatch(/^\^7\.28\.4$/);
    expect(deps['axios']).toMatch(/^\^1\.12\.1$/);
    expect(deps['dotenv']).toMatch(/^\^17\.2\.2$/);
    expect(deps['m3u8stream']).toMatch(/^\^0\.8\.6$/);
    expect(deps['soundcloud-key-fetch']).toMatch(/^\^1\.0\.13$/);
  });

  test('root devDependencies include expected versions (Jest 30.x and linters)', () => {
    const devDeps = lock.packages?.['']?.devDependencies || {};
    expect(devDeps['jest']).toMatch(/^\^30\.1\.3$/);
    expect(devDeps['eslint']).toMatch(/^\^9\.35\.0$/);
    expect(devDeps['@typescript-eslint\/parser']).toMatch(/^\^8\.43\.0$/);
    expect(devDeps['@typescript-eslint\/eslint-plugin']).toMatch(/^\^8\.43\.0$/);
  });

  test('jest packages upgraded to 30.x with correct engines and peer deps', () => {
    const pkgs = lock.packages || {};

    // jest meta package
    const jestPkg = pkgs['node_modules/jest'];
    expect(jestPkg?.version).toBe('30.1.3');
    expect(jestPkg?.engines?.node).toBe('^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0');

    // jest-cli
    const jestCli = pkgs['node_modules/jest-cli'];
    expect(jestCli?.version).toBe('30.1.3');
    expect(jestCli?.engines?.node).toBe('^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0');

    // @jest/core
    const jestCore = pkgs['node_modules/@jest/core'];
    expect(jestCore?.version).toBe('30.1.3');
    expect(jestCore?.engines?.node).toBe('^18.14.0 || ^20.0.0 || ^22.0.0 || >=24.0.0');
    expect(jestCore?.peerDependencies?.['node-notifier']).toBe('^8.0.1 || ^9.0.0 || ^10.0.0');
    expect(jestCore?.peerDependenciesMeta?.['node-notifier']?.optional).toBe(true);
    // Key dependencies
    expect(jestCore?.dependencies?.['jest-runner']).toBe('30.1.3');
    expect(jestCore?.dependencies?.['jest-runtime']).toBe('30.1.3');

    // jest-config and its critical deps
    const jestConfig = pkgs['node_modules/jest-config'];
    expect(jestConfig?.version).toBe('30.1.3');
    expect(jestConfig?.dependencies?.['@babel/core']).toMatch(/^\^7\.27\.4$/);
    expect(jestConfig?.dependencies?.['babel-jest']).toBe('30.1.2');
    expect(jestConfig?.dependencies?.['jest-circus']).toBe('30.1.3');
    expect(jestConfig?.dependencies?.['jest-environment-node']).toBe('30.1.2');
    expect(jestConfig?.dependencies?.['jest-runner']).toBe('30.1.3');
    expect(jestConfig?.dependencies?.['jest-util']).toBe('30.0.5');
    expect(jestConfig?.dependencies?.['jest-validate']).toBe('30.1.0');

    // babel-jest specifics
    const babelJest = pkgs['node_modules/babel-jest'];
    expect(babelJest?.version).toBe('30.1.2');
    expect(babelJest?.peerDependencies?.['@babel/core']).toMatch(/^\^7\.11\.0$/);
  });

  test('no older Jest versions (v28/v29) remain anywhere', () => {
    const pkgs = lock.packages || {};
    const offenders = Object.entries(pkgs).filter(([k, v]) => {
      const ver = v && v.version;
      return /(^|\/)jest/i.test(k) && typeof ver === 'string' && (/^28\./.test(ver) || /^29\./.test(ver));
    });
    expect(offenders).toEqual([]);
  });
});