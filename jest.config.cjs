module.exports = {
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(mjs|cjs|js|ts)$': 'babel-jest'
  },
  moduleFileExtensions: ['mjs', 'cjs', 'js', 'ts', 'json']
}
