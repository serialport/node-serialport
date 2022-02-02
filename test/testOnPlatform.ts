/* eslint-disable mocha/no-exports */
export const testOnPlatform = (platforms: (NodeJS.Platform | 'mock')[], description: string, callback: Mocha.Func) => {
  if (!platforms.includes(process.platform)) {
    return it(`Disabled on "${process.platform}: "${description}"`)
  }
  it(description, callback)
}
