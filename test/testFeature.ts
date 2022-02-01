const testConfig = require('../test-config.json')

export const makeTestFeature = (envName: string) => {
  const config = { ...testConfig.all, ...testConfig[envName] }
  return function testFeature(feature: string, description: string, callback: Mocha.Func) {
    if (config[feature] === false) {
      return it(`Feature "${feature}" is disabled in "${envName}. "${description}"`)
    }
    it(description, callback)
  }
}
