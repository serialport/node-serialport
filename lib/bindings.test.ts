import { assert, shouldReject } from '../test/assert'
import { makeTestFeature } from '../test/makeTestFeature'
import { BindingInterface, OpenOptions, PortInfo, SetOptions } from './binding-interface'
import { autoDetect, AllBindingClasses } from './index'
import MockBinding from '@serialport/binding-mock'

const defaultOpenOptions: OpenOptions = Object.freeze({
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

const defaultSetFlags: SetOptions = Object.freeze({
  brk: false,
  cts: false,
  dtr: true,
  dts: false,
  rts: true,
  lowLatency: false,
})

type MockBinding = any

const listFields = ['path', 'manufacturer', 'serialNumber', 'pnpId', 'locationId', 'vendorId', 'productId']

// All bindings are required to work with an "echo" firmware
// The echo firmware should respond with this data when it's
// ready to echo. This allows for remote device boot up.
// the default firmware is called arduinoEcho.ino
const readyData = Buffer.from('READY')

testBinding('mock', MockBinding, '/dev/exists')
testBinding(process.platform, autoDetect(), process.env.TEST_PORT)

function testBinding(bindingName: string, Binding: AllBindingClasses, testPort?: string) {
  const { testFeature, testHardware, describeHardware } = makeTestFeature(bindingName, testPort)

  describe(`bindings/${bindingName}`, () => {
    before(() => {
      if (bindingName === 'mock') {
        (Binding as MockBinding).createPort(testPort, { echo: true, readyData })
      }
    })

    describe('static method', () => {
      describe('.list', () => {
        it('returns an array', async () => {
          const ports = await Binding.list()
          assert.isArray(ports)
        })

        it('has objects with undefined when there is no data', async () => {
          const ports = await Binding.list()
          assert.isArray(ports)
          if (ports.length === 0) {
            console.log('no ports to test')
            return
          }
          ports.forEach(port => {
            assert.containSubset(Object.keys(port), listFields)
            Object.keys(port).forEach((key: keyof PortInfo) => {
              assert.notEqual(port[key], '', 'empty values should be undefined')
              assert.isNotNull(port[key], 'empty values should be undefined')
            })
          })
        })
      })
    })

    describe('constructor', () => {
      it('creates a binding object', () => {
        const binding = new Binding()
        assert.instanceOf(binding, Binding)
      })
    })

    describe('instance property', () => {
      describe('#isOpen', () => {
        if (!testPort) {
          it('Cannot be tested. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
        })

        it('is true after open and false after close', async () => {
          assert.equal(binding.isOpen, false)
          await binding.open(testPort, defaultOpenOptions)
          assert.equal(binding.isOpen, true)
          await binding.close()
          assert.equal(binding.isOpen, false)
        })
      })
    })

    describe('instance method', () => {
      describe('#open', () => {
        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
        })

        it('errors when providing a bad port', async () => {
          const err = await shouldReject(binding.open('COMBAD', defaultOpenOptions))
          assert.include(err.message, 'COMBAD')
          assert.equal(binding.isOpen, false)
        })

        it('throws when not given a path', async () => {
          await shouldReject(binding.open(''), TypeError)
        })

        it('throws when not given options', async () => {
          await shouldReject(binding.open('COMBAD'), TypeError)
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        describeHardware('with hardware', () => {
          it('cannot open if already open', async () => {
            const options = { ...defaultOpenOptions, lock: false }
            await binding.open(testPort, options)
            await shouldReject(binding.open(testPort, options))
            await binding.close()
          })

          it('keeps open state', async () => {
            await binding.open(testPort, defaultOpenOptions)
            assert.equal(binding.isOpen, true)
            await binding.close()
          })
        })

        describeHardware('arbitrary baud rates', () => {
          [25000, 1000000, 250000].forEach(testBaud => {
            describe(`${testBaud} baud`, () => {
              const customRates = { ...defaultOpenOptions, baudRate: testBaud }
              testFeature(`baudrate.${testBaud}`, `opens at ${testBaud} baud`, async () => {
                await binding.open(testPort, customRates)
                assert.equal(binding.isOpen, true)
                await binding.close()
              })

              testFeature(`baudrate.${testBaud}_check`, `sets ${testBaud} baud successfully`, async () => {
                await binding.open(testPort, customRates)
                const { baudRate } = await binding.getBaudRate()
                assert.equal(baudRate, customRates.baudRate)
                return binding.close()
              })
            })
          })
        })

        describeHardware('optional locking', () => {
          it('locks the port by default', async () => {
            const binding2 = new Binding()
            await binding.open(testPort, defaultOpenOptions)
            assert.equal(binding.isOpen, true)
            await shouldReject(binding2.open(testPort, defaultOpenOptions))
            assert.equal(binding2.isOpen, false)
            await binding.close()
          })

          testFeature('open.unlock', 'can unlock the port', async () => {
            const noLock = { ...defaultOpenOptions, lock: false }
            const binding2 = new Binding()

            await binding.open(testPort, noLock)
            assert.equal(binding.isOpen, true)

            await binding2.open(testPort, noLock)
            assert.equal(binding2.isOpen, true)

            await Promise.all([binding.close(), binding2.close()])
          })
        })
      })

      describe('#close', () => {
        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
        })

        it('errors when already closed', async () => {
          await shouldReject(binding.close())
        })

        testHardware('closes an open file descriptor', () => {
          return binding.open(testPort!, defaultOpenOptions).then(() => {
            assert.equal(binding.isOpen, true)
            return binding.close()
          })
        })
      })

      describe('#update', () => {
        it('throws when not given an object', async () => {
          const binding = new Binding()
          await shouldReject((binding as any).update(), TypeError)
        })

        it('errors asynchronously when not open', done => {
          const binding = new Binding()
          let noZalgo = false
          binding.update({ baudRate: 9600 }).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        describeHardware('update with hardware', () => {
          let binding: BindingInterface
          beforeEach(() => {
            binding = new Binding()
            return binding.open(testPort!, defaultOpenOptions)
          })

          afterEach(() => binding.close())

          it('throws errors when updating nothing', async () => {
            await shouldReject((binding as any).update({}), Error)
          })

          it('errors when not called with options', async () => {
            await shouldReject(
              (binding as any).set(() => { }),
              Error,
            )
          })

          it('updates baudRate', () => {
            return binding.update({ baudRate: 57600 })
          })
        })
      })

      describe('#write', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding()
          let noZalgo = false
          binding
            .write(Buffer.from([]))
            .then(
              data => {
                console.log({ data })
                throw new Error('Should have errored')
              },
              err => {
                assert.instanceOf(err, Error)
                assert(noZalgo)
                done()
              },
            )
            .catch(done)
          noZalgo = true
        })

        it('rejects when not given a buffer', async () => {
          const binding = new Binding()
          await shouldReject((binding as any).write(null), TypeError)
        })

        describeHardware('with hardware', () => {
          let binding: BindingInterface
          beforeEach(() => {
            binding = new Binding()
            return binding.open(testPort!, defaultOpenOptions)
          })

          afterEach(() => binding.close())

          it('resolves after a small write', () => {
            const data = Buffer.from('simple write of 24 bytes')
            return binding.write(data)
          })

          it('resolves after a large write (2k)', function () {
            this.timeout(20000)
            const data = Buffer.alloc(1024 * 2)
            return binding.write(data)
          })

          it('resolves after an empty write', () => {
            const data = Buffer.from([])
            return binding.write(data)
          })
        })
      })

      describe('#drain', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding()
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

        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('drains the port', () => {
          return binding.drain()
        })

        it('waits for in progress writes to finish', async () => {
          let finishedWrite = false
          const write = binding.write(Buffer.alloc(1024 * 2)).then(() => {
            finishedWrite = true
          })
          await binding.drain()
          assert.isTrue(finishedWrite)
          await write
        })
      })

      describe('#flush', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding()
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

        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
          return binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.close())

        it('flushes the port', () => {
          return binding.flush()
        })
      })

      describe('#set', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding()
          let noZalgo = false
          binding.set(defaultSetFlags).catch(err => {
            assert.instanceOf(err, Error)
            assert(noZalgo)
            done()
          })
          noZalgo = true
        })

        it('throws when not called with options', async () => {
          const binding = new Binding()
          await shouldReject(
            (binding as any).set(() => { }),
            TypeError,
          )
        })

        if (!testPort) {
          it('Cannot be tested further. Set the TEST_PORT env var with an available serialport for more testing.')
          return
        }

        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
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
          const binding = new Binding()
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

        let binding: BindingInterface
        let buffer: Buffer
        beforeEach(async () => {
          buffer = Buffer.alloc(readyData.length)
          binding = new Binding()
          await binding.open(testPort, defaultOpenOptions)
        })

        afterEach(() => binding.isOpen && binding.close())

        it('doesn\'t throw if the port is open', async () => {
          await binding.read(buffer, 0, buffer.length)
        })

        it('returns at maximum the requested number of bytes and the buffer', async () => {
          const { bytesRead, buffer: returnedBuffer } = await binding.read(buffer, 0, 1)
          assert.equal(bytesRead, 1)
          assert.equal(buffer, returnedBuffer)
        })

        it('cancels the read when the port is closed', async () => {
          let bytesToRead = 0
          while (bytesToRead < readyData.length) {
            const { bytesRead } = await binding.read(buffer, 0, readyData.length)
            bytesToRead += bytesRead
          }
          const readError = shouldReject(binding.read(Buffer.allocUnsafe(100), 0, 100))
          await binding.close()
          const err = await readError
          assert.isTrue(err.canceled)
        })
      })

      describe('#get', () => {
        it('errors asynchronously when not open', done => {
          const binding = new Binding()
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

        let binding: BindingInterface
        beforeEach(() => {
          binding = new Binding()
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
