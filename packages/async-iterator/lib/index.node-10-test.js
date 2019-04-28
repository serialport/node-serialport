const assert = require('assert')
const { open } = require('./index')
const MockBinding = require('@serialport/binding-mock')

const testPath = '/dev/coolPort'
describe('AsyncIterator', () => {
  if (process.versions.node.split('.')[0] < 10) {
    // eslint-disable-next-line mocha/no-pending-tests
    it('Requires Node 10 or higher')
    return
  }
  describe('.open', () => {
    beforeEach(() => {
      MockBinding.reset()
      MockBinding.createPort(testPath)
    })
    it('Opens port', async () => {
      const port = await open({ Binding: MockBinding, path: testPath })
      assert.strictEqual(port.isOpen, true)
      await port.close()
      assert.strictEqual(port.isOpen, false)
    })
  })
  describe('reading', () => {
    beforeEach(() => {
      MockBinding.reset()
      MockBinding.createPort(testPath)
    })
    it('reads data', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const buffers = []
      const testData = Buffer.from('This is test data.')
      port.binding.emitData(testData)
      for await (const bytes of port) {
        buffers.push(bytes)
        // if we're done reading available data close the port
        if (port.binding.port.data.length === 0) {
          await port.close()
        }
      }
      assert.deepStrictEqual(Buffer.concat(buffers), testData, 'data does not match')
      assert.strictEqual(buffers.length, testData.length)
    })
    it('deals with concurrent reads', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const testData = Buffer.from('This is test data.')
      port.binding.emitData(testData)
      const buffers = await Promise.all([port.next(testData.length / 2), port.next(testData.length / 2)])
      assert.deepStrictEqual(Buffer.concat(buffers.map(itr => itr.value)), testData, 'data does not match')
      await port.close()
    })
    it('deals with huge read requests', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const testData = Buffer.from('This is test data.')
      port.binding.emitData(testData)
      const data = await port.next(10000)
      assert.deepStrictEqual(data.value, testData)
      await port.close()
    })
    it('deals with the port being closed', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const read = port.next()
      await port.close()
      assert.deepStrictEqual(await read, { value: undefined, done: true })
    })
  })
  describe('writes', () => {
    beforeEach(() => {
      MockBinding.reset()
      MockBinding.createPort(testPath)
    })
    it('writes data', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const testData = Buffer.from('This is test data.')
      await port.write(testData)
      assert.deepStrictEqual(port.binding.lastWrite, testData)
    })
    it('queues writes', async () => {
      const port = await open({ Binding: MockBinding, path: testPath, readSize: 1 })
      const testData = Buffer.from('This is test data.')
      const testData2 = Buffer.from('this is also test data')
      await Promise.all([port.write(testData), port.write(testData2)])
      assert.deepStrictEqual(port.binding.lastWrite, testData2)
    })
  })
})
