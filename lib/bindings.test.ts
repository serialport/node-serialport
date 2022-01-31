import { assert, shouldReject } from '../test/assert'
import { makeTestFeature } from '../test/makeTestFeature'
import { BindingInterface, OpenOptions, PortInfo, SetOptions } from '@serialport/bindings-interface'
import { autoDetect } from './index'
import MockBinding from '@serialport/binding-mock'

// All bindings are required to work with an "echo" firmware
const TEST_PORT = process.env.TEST_PORT
const TEST_BAUD = Number(process.env.TEST_BAUDRATE) || 115200

const defaultOpenOptions: OpenOptions = {
  path: 'bad path',
  baudRate: TEST_BAUD,
  dataBits: 8,
  hupcl: false,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
}

const defaultSetFlags: SetOptions = {
  brk: false,
  cts: false,
  dtr: true,
  rts: true,
}

interface MockBinding extends BindingInterface {
  createPort(path: string, options: any): void
}

const listFields = ['path', 'manufacturer', 'serialNumber', 'pnpId', 'locationId', 'vendorId', 'productId']

// testBinding('mock', MockBinding, '/dev/exists')
testBinding(process.platform, autoDetect(), TEST_PORT)

function testBinding(bindingName: string, Binding: BindingInterface, testPort?: string) {
  const { testFeature, describeHardware } = makeTestFeature(bindingName, testPort)

  describe(`bindings/${bindingName}`, () => {
    before(() => {
      if (bindingName === 'mock') {
        (Binding as MockBinding).createPort(testPort!, { echo: true })
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

      describeHardware('.open', () => {
        it('errors when providing a bad port', async () => {
          const err = await shouldReject(Binding.open({
            path: 'COMBAD',
            baudRate: 115200,
          }))
          assert.include(err.message, 'COMBAD')
        })

        it('throws when not given a path', async () => {
          await shouldReject(Binding.open({
            path: '',
            baudRate: 115200,
          }), TypeError)
        })

        it('throws when not given a baudRate', async () => {
          const err = await shouldReject(Binding.open({
            path: 'COMBAD',
            baudRate: undefined,
          } as any))
          assert.include(err.message, 'baudRate')
        })

        it('throws when not given options', async () => {
          const err = await shouldReject(Binding.open(undefined as any))
          assert.include(err.message, 'options')
        })


        describeHardware('with hardware', () => {
          it('keeps open state', async () => {
            const port = await Binding.open({ ...defaultOpenOptions, path: testPort! })
            assert.equal(port.isOpen, true)
            await port.close()
            assert.equal(port.isOpen, false)
          })
        })

        describeHardware('arbitrary baud rates', () => {
          [25000, 1000000, 250000].forEach(testBaud => {
            describe(`${testBaud} baud`, () => {
              const customRates = { ...defaultOpenOptions, baudRate: testBaud, path: testPort! }

              testFeature(`baudrate.${testBaud}`, `opens at ${testBaud} baud`, async () => {
                const port = await Binding.open(customRates)
                assert.equal(port.isOpen, true)
                await port.close()
              })

              testFeature(`baudrate.${testBaud}_check`, `sets ${testBaud} baud successfully`, async () => {
                const port = await Binding.open(customRates)
                const { baudRate } = await port.getBaudRate()
                assert.equal(baudRate, customRates.baudRate)
                await port.close()
              })
            })
          })
        })

        describeHardware('optional locking', () => {
          const options = { ...defaultOpenOptions, path: testPort!, lock: true }
          it('locks the port by default', async () => {
            const port = await Binding.open(options)
            assert.equal(port.isOpen, true)
            await shouldReject(Binding.open(options))
            await port.close()
          })

          testFeature('open.unlock', 'can unlock the port', async () => {
            const noLock = { ...options, lock: false }

            const port = await Binding.open(noLock)
            assert.equal(port.isOpen, true)

            const port2 = await Binding.open(noLock)
            assert.equal(port2.isOpen, true)

            await Promise.all([port.close(), port2.close()])
          })
        })
      })
    })

    describeHardware('PortInstance', () => {
      const options = { ...defaultOpenOptions, path: testPort! }
      describe('#isOpen', () => {
        it('is true after open and false after close', async () => {
          const port = await Binding.open(options)
          assert.equal(port.isOpen, true)
          await port.close()
          assert.equal(port.isOpen, false)
        })
      })

      describe('#close', () => {
        it('errors when already closed', async () => {
          const port = await Binding.open(options)
          assert.equal(port.isOpen, true)
          await port.close()
          assert.equal(port.isOpen, false)
          await shouldReject(port.close())
        })

        it('closes an open port', async () => {
          const port = await Binding.open(options)
          await port.close()
          assert.equal(port.isOpen, false)
        })
      })

      describe('#update', () => {
        it('errors when not given an object', async () => {
          const port = await Binding.open(options)
          await shouldReject(port.update(undefined as any), TypeError)
          await port.close()
        })

        it('errors when updating nothing', async () => {
          const port = await Binding.open(options)
          await shouldReject(port.update({} as any), Error)
          await port.close()
        })

        it('errors when closed', async () => {
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.update({ baudRate: 57600 }), Error)
        })


        testFeature('getBaudRate', 'updates baudRate', async () => {
          const port = await Binding.open(options)
          await port.update({ baudRate: 57600 })
          const { baudRate } = await port.getBaudRate()
          assert.equal(baudRate, 57600)
          await port.close()
        })
      })


      // because of the nature of opening and closing the ports a fair amount of data
      // is left over on the pipe and isn't cleared when flushed on unix
      describe('#read', () => {
        const smallSampleData = Buffer.from('12345')

        it('errors when closed', async () => {
          const buffer = Buffer.alloc(5)
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.read(buffer, 0, buffer.length), Error)
        })

        it('reads requested number of bytes', async () => {
          const buffer = Buffer.alloc(smallSampleData.length)
          const port = await Binding.open(options)
          await port.write(smallSampleData)
          await port.read(buffer, 0, buffer.length)
          assert.deepEqual(smallSampleData, buffer, 'Data matches')
          await port.close()
        })

        it('returns at maximum the requested number of bytes and the buffer', async () => {
          const buffer = Buffer.alloc(smallSampleData.length)
          const port = await Binding.open(options)
          await port.write(smallSampleData)
          const { bytesRead, buffer: returnedBuffer } = await port.read(buffer, 0, 1)
          assert.equal(bytesRead, 1)
          assert.strictEqual(buffer, returnedBuffer)
          assert.deepEqual(buffer, Buffer.from([smallSampleData[0], 0, 0, 0, 0]))
          await port.close()
        })

        it('cancels the read when the port is closed', async () => {
          const port = await Binding.open(options)
          const readError = shouldReject(port.read(Buffer.alloc(100), 0, 100))
          await port.close()
          const err = await readError
          assert.isTrue(err.canceled)
        })
      })

      describe('#write', () => {
        it('errors when not given a buffer', async () => {
          const port = await Binding.open(options)
          await shouldReject(port.write(null as any), TypeError)
          await port.close()
        })

        it('errors when closed', async () => {
          const data = Buffer.from('data!')
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.write(data), Error)
        })

        it('resolves after a small write', async () => {
          const data = Buffer.from('simple write of 24 bytes')
          const port = await Binding.open(options)
          await port.write(data)
          await port.close()
        })

        it('resolves after a large write (2k)', async function () {
          this.timeout(20000)
          const data = Buffer.alloc(1024 * 2)
          const port = await Binding.open(options)
          await port.write(data)
          await port.close()
        })

        it('resolves after an empty write', async () => {
          const data = Buffer.from([])
          const port = await Binding.open(options)
          await port.write(data)
          await port.close()
        })
      })

      describe('#drain', () => {
        it('errors when closed', async () => {
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.drain(), Error)
        })

        it('drains the port', async () => {
          const port = await Binding.open(options)
          await port.drain()
          await port.close()
        })

        it('waits for in progress writes to finish', async () => {
          const port = await Binding.open(options)
          let finishedWrite = false
          const write = port.write(Buffer.alloc(1024 * 2)).then(() => {
            finishedWrite = true
          })
          await port.drain()
          assert.isTrue(finishedWrite)
          await write
          await port.close()
        })
      })

      describe('#flush', () => {
        it('errors when closed', async () => {
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.flush(), Error)
        })

        it('flushes the port', async () => {
          const port = await Binding.open(options)
          await port.flush()
          await port.close()
        })
      })

      describe('#set', () => {
        it('errors when closed', async () => {
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.set(defaultSetFlags), Error)
        })

        it('throws when not called with options', async () => {
          const port = await Binding.open(options)
          await shouldReject(port.set(undefined as any), TypeError)
          await port.close()
        })

        it('sets flags on the port', async () => {
          const port = await Binding.open(options)
          await port.set(defaultSetFlags)
          await port.close()
        })
      })

      describe('#get', () => {
        it('errors when closed', async () => {
          const port = await Binding.open(options)
          await port.close()
          await shouldReject(port.get(), Error)
        })

        it('gets modem line status from the port', async () => {
          const port = await Binding.open(options)
          const status = await port.get()
          assert.isObject(status)
          assert.isBoolean(status.cts)
          assert.isBoolean(status.dsr)
          assert.isBoolean(status.dcd)
          await port.close()
        })
      })
    })
  })
}
