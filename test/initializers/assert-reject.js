global.shouldReject = async (promise, errType = Error, message = 'Should have rejected') => {
  try {
    await promise
  } catch (err) {
    assert.instanceOf(err, errType)
    return err
  }
  throw new Error(message)
}
