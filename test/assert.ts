import { assert, use } from 'chai'
import chaiSubset from 'chai-subset'
use(chaiSubset)

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
