const crypto = require('crypto')
const SerialPort = require('../')

let platform
switch (process.platform) {
  case 'win32':
  case 'darwin':
  case 'linux':
    platform = process.platform
    break
  default:
    throw new Error(`Unknown platform "${process.platform}"`)
}

const readyData = Buffer.from('READY')

// test everything on our mock biding and natively
const DetectedBinding = SerialPort.Binding
const MockBinding = require('@serialport/binding-mock')

const mockTestPort = '/dev/exists'

// eslint-disable-next-line no-use-before-define
integrationTest('mock', mockTestPort, MockBinding)

// eslint-disable-next-line no-use-before-define
integrationTest(platform, process.env.TEST_PORT, DetectedBinding)

// Be careful to close the ports when you're done with them
// Ports are by default exclusively locked so a failure fails all tests
function integrationTest(platform, testPort, Binding) {
  const testFeature = makeTestFeature(platform)

  describe(`${platform} SerialPort Integration Tests`, () => {
    if (!testPort) {
      it(`${platform} tests requires an Arduino loaded with the arduinoEcho program on a serialport set to the TEST_PORT env var`)
      return
    }

    before(() => {
      if (Binding === MockBinding) {
        MockBinding.createPort(testPort, { echo: true, readyData })
      }
      SerialPort.Binding = Binding
    })

    describe('static Method', () => {
      describe('.list', () => {
        it('contains the test port', done => {
          function normalizePath(name) {
            const parts = name.split('.')
            return parts[parts.length - 1].toLowerCase()
          }

          SerialPort.list((err, ports) => {
            assert.isNull(err)
            let foundPort = false
            ports.forEach(port => {
              if (normalizePath(port.comName) === normalizePath(testPort)) {
                foundPort = true
              }
            })
            assert.isTrue(foundPort)
            done()
          })
        })
      })
    })

    describe('constructor', () => {
      it('provides an error in callback when trying to open an invalid port', function(done) {
        this.port = new SerialPort('COMBAD', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('emits an error event when trying to open an invalid port', done => {
        const port = new SerialPort('COM99')
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })

    describe('opening and closing', () => {
      it('can open and close', done => {
        const port = new SerialPort(testPort)
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
        const port = new SerialPort(testPort, err => {
          assert.isNull(err)
          port.open(err => {
            assert.instanceOf(err, Error)
            port.close(done)
          })
        })
      })

      it('cannot be opened while opening', done => {
        const port = new SerialPort(testPort, { autoOpen: false })
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
        const port = new SerialPort(testPort, { autoOpen: false })
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

      it('can be read after closing and opening', function(done) {
        this.timeout(6000)
        const port = new SerialPort(testPort, { autoOpen: false })
        port.on('error', done)

        port.open(err => {
          assert.isNull(err)
        })
        port.once('data', () => {
          port.close()
        })

        port.once('close', err => {
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
        const port = new SerialPort(testPort, { autoOpen: false })
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
        const port = new SerialPort(testPort, () => {
          port.update({ baudRate: 57600 }, err => {
            assert.isNull(err)
            port.close(done)
          })
        })
      })
    })

    describe('#read and #write', () => {
      it('2k test', function(done) {
        this.timeout(20000)
        // 2k of random data
        const input = crypto.randomBytes(1024 * 2)
        const port = new SerialPort(testPort)
        port.on('error', done)
        const ready = port.pipe(new SerialPort.parsers.Ready({ delimiter: readyData }))

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
        const port = new SerialPort(testPort)
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
        const port = new SerialPort(testPort)
        port.on('error', done)
        const ready = port.pipe(new SerialPort.parsers.Ready({ delimiter: 'READY' }))
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
        const port = new SerialPort(testPort)
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
}
