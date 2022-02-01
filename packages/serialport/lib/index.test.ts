const { randomBytes } = require('crypto')
import { SerialPort, ReadyParser, SerialPortOpenOptions } from './'
import { assert } from '../../../test/assert'
import { makeTestFeature } from '../../../test/testFeature'

const platform = process.platform
if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
  throw new Error(`Unknown platform "${process.platform}"`)
}

const readyData = Buffer.from('READY')
const TEST_PORT = process.env.TEST_PORT
const TEST_BAUD = Number(process.env.TEST_BAUDRATE) || 115200

// Be careful to close the ports when you're done with them
// Ports are by default exclusively locked so a failure fails all tests
const testFeature = makeTestFeature(platform)

describe(`${platform} SerialPort Integration Tests`, () => {
  if (!TEST_PORT) {
    it(`${platform} tests requires an Arduino loaded with the arduinoEcho program on a serialport set to the TEST_PORT env var`)
    return
  }

  const openOptions: SerialPortOpenOptions = { path: TEST_PORT, baudRate: TEST_BAUD}

  describe('static Method', () => {
    describe('.list', () => {
      it('contains the test port', async () => {
        function normalizePath(name: string) {
          const parts = name.split('.')
          return parts[parts.length - 1].toLowerCase()
        }

        const ports = await SerialPort.list()
        const foundPort = ports.some(port => normalizePath(port.path) === normalizePath(TEST_PORT))
        assert.isTrue(foundPort)
      })
    })
  })

  describe('constructor', () => {
    it('provides an error in callback when trying to open an invalid port', done => {
      new SerialPort({ ...openOptions, path: 'COMBAD' }, err => {
        assert.instanceOf(err, Error)
        done()
      })
    })

    it('emits an error event when trying to open an invalid port', done => {
      const port = new SerialPort({ ...openOptions, path: 'COM99' })
      port.on('error', err => {
        assert.instanceOf(err, Error)
        done()
      })
    })
  })

  describe('opening and closing', () => {
    it('can open and close', done => {
      const port = new SerialPort(openOptions)
      port.on('open', () => {
        assert.isTrue(port.isOpen)
        port.close()
      })
      port.on('close', () => {
        assert.isFalse(port.isOpen)
        done()
      })
    })

    it('cannot be opened again after open', done => {
      const port = new SerialPort(openOptions, err => {
        assert.isNull(err)
        port.open(err => {
          assert.instanceOf(err, Error)
          port.close(done)
        })
      })
    })

    it('cannot be opened while opening', done => {
      const port = new SerialPort({...openOptions, autoOpen: false })
      port.open(err => {
        assert.isNull(err)
      })
      port.open(err => {
        assert.instanceOf(err, Error)
      })
      port.on('open', () => {
        port.close(done)
      })
    })

    it('can open and close ports repetitively', done => {
      const port = new SerialPort({...openOptions, autoOpen: false })
      port.open(err => {
        assert.isNull(err)
        port.close(err => {
          assert.isNull(err)
          port.open(err => {
            assert.isNull(err)
            port.close(done)
          })
        })
      })
    })

    it('can be read after closing and opening', function (done) {
      this.timeout(6000)
      const port = new SerialPort({...openOptions, autoOpen: false })
      port.on('error', done)

      port.open(err => {
        assert.isNull(err)
      })
      port.once('data', () => {
        port.close()
      })

      port.once('close', (err: null | Error) => {
        assert.isNull(err)
        port.open(err => {
          assert.isNull(err)
        })
        port.once('data', () => {
          port.close(done)
        })
      })
    })

    it('errors if closing during a write', done => {
      const port = new SerialPort({...openOptions, autoOpen: false })
      port.open(() => {
        port.on('error', err => {
          assert.instanceOf(err, Error)
          port.close(() => done())
        })
        port.write(Buffer.alloc(1024 * 5, 0))
        port.close()
      })
    })
  })

  describe('#update', () => {
    testFeature('port.update-baudrate', 'allows changing the baud rate of an open port', done => {
      const port = new SerialPort(openOptions, () => {
        port.update({ baudRate: 57600 }, err => {
          assert.isNull(err)
          port.close(done)
        })
      })
    })
  })

  describe('#read and #write', () => {
    it('2k test', function (done) {
      this.timeout(20000)
      // 2k of random data
      const input = randomBytes(1024 * 2)
      const port = new SerialPort(openOptions)
      port.on('error', done)
      const ready = port.pipe(new ReadyParser({ delimiter: readyData }))

      // this will trigger from the "READY" the arduino sends when it's... ready
      ready.on('ready', () => {
        port.write(input)
      })

      const readData = Buffer.alloc(input.length, 0)
      let bytesRead = 0
      ready.on('data', data => {
        bytesRead += data.copy(readData, bytesRead)
        if (bytesRead >= input.length) {
          try {
            assert.equal(readData.length, input.length, 'write length matches')
            assert.deepEqual(readData, input, 'read data matches expected readData')
            port.close(done)
          } catch (e) {
            done(e)
          }
        }
      })
    })
  })

  describe('#flush', () => {
    it('discards any received data', done => {
      const port = new SerialPort(openOptions)
      port.on('open', () =>
        process.nextTick(() => {
          port.flush(err => {
            port.on('readable', () => {
              try {
                assert.isNull(port.read())
              } catch (e) {
                return done(e)
              }
              done(new Error('got a readable event after flushing the port'))
            })
            try {
              assert.isNull(err)
              assert.isNull(port.read())
            } catch (e) {
              return done(e)
            }
            port.close(done)
          })
        })
      )
    })
    it('deals with flushing during a read', done => {
      const port = new SerialPort(openOptions)
      port.on('error', done)
      const ready = port.pipe(new ReadyParser({ delimiter: 'READY' }))
      ready.on('ready', () => {
        // we should have a pending read now since we're in flowing mode
        port.flush(err => {
          try {
            assert.isNull(err)
          } catch (e) {
            return done(e)
          }
          port.close(done)
        })
      })
    })
  })

  describe('#drain', () => {
    it('waits for in progress or queued writes to finish', done => {
      const port = new SerialPort(openOptions)
      port.on('error', done)
      let finishedWrite = false
      port.write(Buffer.alloc(10), () => {
        finishedWrite = true
      })
      port.drain(err => {
        assert.isNull(err)
        assert.isTrue(finishedWrite)
        done()
      })
    })
  })
})
