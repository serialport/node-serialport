/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto'
import { SerialPort as SerialPortAutoDetect, SerialPortMock } from './'
import { assert } from '../../../test/assert'
import { testOnPlatform } from '../../../test/testOnPlatform'
import { LinuxOpenOptions } from '@serialport/bindings-cpp'

const platform = process.platform
if (platform !== 'win32' && platform !== 'darwin' && platform !== 'linux') {
  throw new Error(`Unknown platform "${process.platform}"`)
}

const TEST_PORT = process.env.TEST_PORT
const TEST_BAUD = Number(process.env.TEST_BAUDRATE) || 115200

// Be careful to close the ports when you're done with them
// Ports are by default exclusively locked so a failure fails all tests
testSerialPortClass(SerialPortMock, 'mock', '/dev/exists', 115200)
testSerialPortClass(SerialPortAutoDetect, platform, TEST_PORT, TEST_BAUD)

function testSerialPortClass(
  SerialPort: typeof SerialPortAutoDetect | typeof SerialPortMock,
  platform: string,
  path: string | undefined,
  baudRate: number
) {
  describe(`${platform} SerialPort Integration Tests`, () => {
    if (!path) {
      it(`${platform} tests requires a loopback serialport set to the TEST_PORT env var and it's baudrate set on TEST_BAUDRATE (defaults to 115200)`)
      return
    }

    beforeEach(() => {
      if (platform === 'mock') {
        SerialPortMock.binding.createPort('/dev/exists', { echo: true, maxReadSize: 50 })
      }
    })

    afterEach(() => {
      if (platform === 'mock') {
        SerialPortMock.binding.reset()
      }
    })

    const openOptions = { path, baudRate }

    describe('static Method', () => {
      describe('.list', () => {
        it('contains the test port', async () => {
          function normalizePath(name: string) {
            const parts = name.split('.')
            return parts[parts.length - 1].toLowerCase()
          }

          const ports = await SerialPort.list()
          const foundPort = ports.some(port => normalizePath(port.path) === normalizePath(path))
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

      it('allows platform specific options', done => {
        new SerialPort({
          path: '/bad/port',
          baudRate: 9600,
          vmin: 10,
        } as LinuxOpenOptions).on('error', () => {
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
        const port = new SerialPort({ ...openOptions, autoOpen: false })
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
        const port = new SerialPort({ ...openOptions, autoOpen: false })
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
        const port = new SerialPort({ ...openOptions, autoOpen: false })
        port.on('error', done)

        port.open(err => {
          assert.isNull(err)
          port.write('a')
        })
        port.once('data', () => {
          port.close()
        })

        port.once('close', (err: null | Error) => {
          assert.isNull(err)
          port.open(err => {
            assert.isNull(err)
            port.write('a')
          })
          port.once('data', () => {
            port.close(done)
          })
        })
      })

      it('errors if closing during a write', done => {
        const port = new SerialPort({ ...openOptions, autoOpen: false })
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
      testOnPlatform(['linux', 'darwin', 'mock'], 'allows changing the baud rate of an open port', done => {
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
        const input = Buffer.from(randomBytes(1024).toString('hex'))
        const port = new SerialPort(openOptions)
        port.on('error', done)
        port.write(input)

        let readData = Buffer.alloc(0)
        port.on('data', data => {
          readData = Buffer.concat([readData, data])
          // console.log('got data', data.length, 'read data', readData.length)
          if (readData.length >= input.length) {
            console.log('probably done')
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
        port.on('data', () => {}) // enter flowing mode
        port.once('data', () => {
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
        port.write('flush') // trigger the flush
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
          port.close(done)
        })
      })
    })
  })
}
