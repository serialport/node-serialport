if (process.versions.node.split('.')[0] < 10) {
  describe('AsyncIterator', () => {
    // eslint-disable-next-line mocha/no-pending-tests
    it('Requires Node 10 or higher')
  })
} else {
  require('./index.node-10-test')
}
