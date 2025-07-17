// eslint-disable-next-line @typescript-eslint/no-require-imports
const { assert } = require('chai')

export const shouldReject = async (promise: Promise<unknown>, errType = Error, message = 'Should have rejected') => {
  try {
    await promise
  } catch (err) {
    assert.instanceOf(err, errType)
    return err
  }
  throw new Error(message)
}

export { assert }
