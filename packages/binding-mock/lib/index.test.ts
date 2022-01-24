import { MockBinding } from './'
import { OpenOptions } from '@serialport/bindings-cpp'
import { assert, shouldReject } from '../../../test/initializers/assert'

const openOptions: OpenOptions = {
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
  it('constructs', () => {
    new MockBinding()
  })

  let binding: MockBinding

  describe('instance method', () => {
    beforeEach(() => {
      binding = new MockBinding()
    })

    describe('open', () => {
      describe('when phony port not created', () => {
        it('should reject', () => {
          return shouldReject(binding.open('/dev/ttyUSB0', openOptions))
        })
      })

      describe('when phony port created', () => {
        beforeEach(() => {
          MockBinding.createPort('/dev/ttyUSB0')
        })

        afterEach(() => {
          MockBinding.reset()
        })

        it('should open the phony port', async () => {
          await binding.open('/dev/ttyUSB0', openOptions)
          assert.isTrue(binding.isOpen)
        })

        it('should have a "port" prop with "info.serialNumber" prop', async () => {
          await binding.open('/dev/ttyUSB0', openOptions)
          assert.strictEqual(binding.port?.info.serialNumber, '1')
        })
      })
    })
  })

  describe('static method', () => {
    describe('createPort', () => {
      afterEach(() => {
        MockBinding.reset()
      })

      it('should increment the serialNumber', async () => {
        MockBinding.createPort('/dev/ttyUSB0')
        MockBinding.createPort('/dev/ttyUSB1')
        const binding1 = new MockBinding()
        await binding1.open('/dev/ttyUSB0', openOptions)
        const binding2 = new MockBinding()
        await binding2.open('/dev/ttyUSB1', openOptions)
        assert.strictEqual(binding2.port?.info.serialNumber, '2')
      })
    })
    describe('reset', () => {
      beforeEach(async () => {
        MockBinding.createPort('/dev/ttyUSB0')
        binding = new MockBinding()
        await binding.open('/dev/ttyUSB0', openOptions)
        assert.strictEqual(binding.port?.info.serialNumber, '1')
        await binding.close()
      })

      afterEach(async () => {
        // speculative cleanup
        try {
          await binding.close()
        } catch (ignored) {
          // ignored
        }
      })

      it('should delete any configured phony ports', () => {
        MockBinding.reset()
        return shouldReject(binding.open('/dev/ttyUSB0', openOptions))
      })

      it('should reset the serialNumber assigned to the phony port', async () => {
        MockBinding.reset()
        MockBinding.createPort('/dev/ttyUSB0')
        await binding.open('/dev/ttyUSB0', openOptions)
        assert.strictEqual(binding.port?.info.serialNumber, '1')
      })
    })
  })
})
