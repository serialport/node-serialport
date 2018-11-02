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

const defaultOpenOptions = Object.freeze({
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
})

const defaultSetFlags = Object.freeze({
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true,
})

const listFields = ['comName', 'manufacturer', 'serialNumber', 'pnpId', 'locationId', 'vendorId', 'productId']

const bindingsToTest = ['mock', platform]

function disconnect(err) {
  throw err || new Error('Unknown disconnection')
}

// All bindings are required to work with an "echo" firmware
// The echo firmware should respond with this data when it's
// ready to echo. This allows for remote device bootup.
// the default firmware is called arduinoEcho.ino
const readyData = Buffer.from('READY')

// Test our mock binding and the binding for the platform we're running on
bindingsToTest.forEach(bindingName => {
  const Binding = bindingName === 'mock' ? require('@serialport/binding-mock') : require(`./${bindingName}`)
  let testPort = process.env.TEST_PORT

  if (bindingName === 'mock') {
    testPort = '/dev/exists'
  }

  // eslint-disable-next-line no-use-before-define
  testBinding(bindingName, Binding, testPort)
})

function testBinding(bindingName, Binding, testPort) {
  const testFeature = makeTestFeature(bindingName)

  describe(`bindings/${bindingName}`, () => {
    before(() => {
      if (bindingName === 'mock') {
        Binding.createPort(testPort, { echo: true, readyData })
      }
    })

    describe('static method', () => {
      describe('.list', () => {
        it('returns an array', () => {
          return Binding.list().then(ports => {
            assert.isArray(ports)
          })
        })

        it('has objects with undefined when there is no data', () => {
          return Binding.list().then(ports => {
            assert.isArray(ports)
            if (ports.length === 0) {
              console.log('no ports to test')
              return
            }
            ports.forEach(port => {
              assert.containSubset(Object.keys(port), listFields)
              Object.keys(port).forEach(key => {
                assert.notEqual(port[key], '', 'empty values should be undefined')
                assert.isNotNull(port[key], 'empty values should be undefined')
              })
            })
          })
        })
      })
    })

    describe('constructor', () => {
      it('creates a binding object', () => {
        const binding = new Binding({
          disconnect,
        })
        assert.instanceOf(binding, Binding)
      })

      it('throws when not given an options object', done => {
        try {
          new Binding()
        } catch (e) {
          assert.instanceOf(e, TypeError)
          done()
        }
      })
    })

    describe('instance property', () => {
      describe('#isOpen', () => {
        if (!testPort) {
          it('Cannot be tested. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
        })

        it('is true after open and false after close', () => {
          assert.equal(binding.isOpen, false)
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true)
            return binding.close().then(() => {
              assert.equal(binding.isOpen, false)
            })
          })
        })
      })
    })

    describe('instance method', () => {
      describe('#open', () => {
        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
        })

        it('errors when providing a bad port', () => {
          return binding.open('COMBAD', defaultOpenOptions).catch(err => {
            assert.instanceOf(err, Error)
            assert.include(err.message, 'COMBAD')
            assert.equal(binding.isOpen, false)
          })
        })

        it('throws when not given a path', done => {
          try {
            binding.open('')
          } catch (e) {
            assert.instanceOf(e, TypeError)
            done()
          }
        })

        it('throws when not given options', done => {
          try {
            binding.open('COMBAD')
          } catch (e) {
            assert.instanceOf(e, TypeError)
            done()
          }
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        it('cannot open if already open', () => {
          const options = Object.assign({}, defaultOpenOptions, {
            lock: false,
          })
          return binding.open(testPort, options).then(() => {
            return binding.open(testPort, options).catch(err => {
              assert.instanceOf(err, Error)
              return binding.close()
            })
          })
        })

        it('keeps open state', () => {
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true)
            return binding.close()
          })
        })

        describe('arbitrary baud rates', () => {
          ;[25000, 1000000, 250000].forEach(testBaud => {
            describe(`${testBaud} baud`, () => {
              const customRates = Object.assign({}, defaultOpenOptions, {
                baudRate: testBaud,
              })
              testFeature(`baudrate.${testBaud}`, `opens at ${testBaud} baud`, () => {
                return binding.open(testPort, customRates).then(() => {
                  assert.equal(binding.isOpen, true)
                  return binding.close()
                })
              })

              testFeature(`baudrate.${testBaud}_check`, `sets ${testBaud} baud successfully`, () => {
                return binding
                  .open(testPort, customRates)
                  .then(() => binding.getBaudRate())
                  .then(res => {
                    assert.equal(res.baudRate, customRates.baudRate)
                    return binding.close()
                  })
              })
            })
          })
        })

        describe('optional locking', () => {
          it('locks the port by default', () => {
            const binding2 = new Binding({ disconnect })

            return binding
              .open(testPort, defaultOpenOptions)
              .then(() => {
                assert.equal(binding.isOpen, true)
              })
              .then(() => {
                return binding2.open(testPort, defaultOpenOptions).catch(err => {
                  assert.instanceOf(err, Error)
                  assert.equal(binding2.isOpen, false)
                  return binding.close()
                })
              })
          })

          testFeature('open.unlock', 'can unlock the port', () => {
            const noLock = Object.assign({}, defaultOpenOptions, {
              lock: false,
            })
            const binding2 = new Binding({ disconnect })

            return binding
              .open(testPort, noLock)
              .then(() => assert.equal(binding.isOpen, true))
              .then(() => binding2.open(testPort, noLock))
              .then(() => assert.equal(binding2.isOpen, true))
              .then(() => Promise.all([binding.close(), binding2.close()]))
          })
        })
      })

      describe('#close', () => {
        let binding
        beforeEach(() => {
          binding = new Binding({ disconnect })
        })

        it('errors when already closed', () => {
          return binding.close().catch(err => {
            assert.instanceOf(err, Error)
          })
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        it('closes an open file descriptor', () => {
          return binding.open(testPort, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true)
            return binding.close()
          })
        })
      })

      describe('#update', () => {
        it('throws when not given an object', done => {
          const binding = new Binding({ disconnect })

          try {
            binding.update()
          } catch (e) {
            assert.instanceOf(e, TypeError)
            done()
          }
        })

        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.update({ baudRate: 9600 }).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({ disconnect })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('throws errors when updating nothing', done => {
          try {
            binding.update({})
          } catch (err) {
            assert.instanceOf(err, Error)
            done()
          }
        })

        it('errors when not called with options', done => {
          try {
            binding.set(() => {})
          } catch (e) {
            assert.instanceOf(e, Error)
            done()
          }
        })

        it('updates baudRate', () => {
          return binding.update({ baudRate: 57600 })
        })
      })

      describe('#write', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.write(Buffer.from([])).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        it('throws when not given a buffer', done => {
          const binding = new Binding({
            disconnect,
          })
          try {
            binding.write(null)
          } catch (e) {
            assert.instanceOf(e, TypeError)
            done()
          }
        })

        if (!testPort) {
          it(`Cannot be tested as we have no test ports on ${platform}`)
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('resolves after a small write', () => {
          const data = Buffer.from('simple write of 24 bytes')
          return binding.write(data)
        })

        it('resolves after a large write (2k)', function() {
          this.timeout(20000)
          const data = Buffer.alloc(1024 * 2)
          return binding.write(data)
        })

        it('resolves after an empty write', () => {
          const data = Buffer.from([])
          return binding.write(data)
        })
      })

      describe('#drain', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.drain().catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('drains the port', () => {
          return binding.drain()
        })

        it('waits for in progress writes to finish', function(done) {
          this.timeout(10000)
          let finishedWrite = false
          binding
            .write(Buffer.alloc(1024 * 2))
            .then(() => {
              finishedWrite = true
            })
            .catch(done)
          binding
            .drain(() => {
              assert.isTrue(finishedWrite)
            })
            .then(done, done)
        })
      })

      describe('#flush', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.flush().catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('flushes the port', () => {
          return binding.flush()
        })
      })

      describe('#set', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.set(defaultSetFlags).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        it('throws when not called with options', done => {
          const binding = new Binding({
            disconnect,
          })
          try {
            binding.set(() => {})
          } catch (e) {
            assert.instanceOf(e, TypeError)
            done()
          }
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({
            disconnect,
          })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        testFeature('set.set', 'sets flags on the port', () => {
          return binding.set(defaultSetFlags)
        })
      })

      // because of the nature of opening and closing the ports a fair amount of data
      // is left over on the pipe and isn't cleared when flushed on unix
      describe('#read', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({ disconnect })
          const buffer = Buffer.alloc(5)
          let noZalgo = false
          binding.read(buffer, 0, buffer.length).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding, buffer
        beforeEach(() => {
          buffer = Buffer.alloc(readyData.length)
          binding = new Binding({ disconnect })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it("doesn't throw if the port is open", () => {
          return binding.read(buffer, 0, buffer.length)
        })

        it('returns at maximum the requested number of bytes', () => {
          return binding.read(buffer, 0, 1).then(bytesRead => {
            assert.equal(bytesRead, 1)
          })
        })
      })

      describe('#get', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding({
            disconnect,
          })
          let noZalgo = false
          binding.get().catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding
        beforeEach(() => {
          binding = new Binding({ disconnect })
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        testFeature('get.get', 'gets modem line status from the port', () => {
          return binding.get().then(status => {
            assert.isObject(status)
            assert.isBoolean(status.cts)
            assert.isBoolean(status.dsr)
            assert.isBoolean(status.dcd)
          })
        })
      })
    })
  })
}
