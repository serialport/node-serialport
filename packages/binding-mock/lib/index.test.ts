import { MockBinding } from './'
import { OpenOptions } from '@serialport/bindings-interface'
import { assert, shouldReject } from '../../../test/assert'

const openOptions: OpenOptions = {
  path: '/dev/exists',
  baudRate: 9600,
  dataBits: 8,
  lock: false,
  stopBits: 1,
  parity: 'none',
  rtscts: false,
  xon: false,
  xoff: false,
  xany: false,
  hupcl: false,
}

describe('MockBinding', () => {
  afterEach(() => {
    MockBinding.reset()
  })

  describe('instance method', () => {
    describe('open', () => {
      describe('when phony port not created', () => {
        it('should reject', async () => {
          await shouldReject(MockBinding.open(openOptions))
        })
      })

      describe('when phony port created', () => {
        beforeEach(() => {
          MockBinding.createPort('/dev/exists')
        })

        it('should open the phony port', async () => {
          const port = await MockBinding.open(openOptions)
          assert.isTrue(port.isOpen)
        })

        it('should have a "port" prop with "info.serialNumber" prop', async () => {
          const port = await MockBinding.open(openOptions)
          assert.strictEqual(port.port.info.serialNumber, '1')
        })
      })
    })
  })

  describe('static method', () => {
    describe('createPort', () => {
      it('should increment the serialNumber', async () => {
        MockBinding.createPort('/dev/exists')
        MockBinding.createPort('/dev/ttyUSB1')
        const port1 = await MockBinding.open(openOptions)
        const port2 = await MockBinding.open({ ...openOptions, path: '/dev/ttyUSB1' })
        assert.strictEqual(port1.port.info.serialNumber, '1')
        assert.strictEqual(port2.port.info.serialNumber, '2')
      })
    })
    describe('reset', () => {
      beforeEach(async () => {
        MockBinding.createPort('/dev/exists')
        const port = await MockBinding.open(openOptions)
        assert.strictEqual(port.port?.info.serialNumber, '1')
        await port.close()
      })

      it('should delete any configured phony ports', async () => {
        MockBinding.reset()
        await shouldReject(MockBinding.open(openOptions))
      })

      it('should reset the serialNumber assigned to the phony port', async () => {
        MockBinding.reset()
        MockBinding.createPort('/dev/exists')
        const port = await MockBinding.open(openOptions)
        assert.strictEqual(port.port.info.serialNumber, '1')
      })
    })
  })
})
