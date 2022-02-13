import { ErrorCallback, OpenOptions, SerialPortStream } from '@serialport/stream'
import { MockBinding, MockBindingInterface } from '@serialport/binding-mock'

export type SerialPortMockOpenOptions = Omit<OpenOptions<MockBindingInterface>, 'binding'>

export class SerialPortMock extends SerialPortStream<MockBindingInterface> {
  static list = MockBinding.list
  static readonly binding = MockBinding

  constructor(options: SerialPortMockOpenOptions, openCallback?: ErrorCallback) {
    const opts: OpenOptions<MockBindingInterface> = {
      binding: MockBinding,
      ...options,
    }
    super(opts, openCallback)
  }
}
