import { BindingInterface, OpenOptions, PortStatus, SetOptions, UpdateOptions } from './binding-interface'
import { shouldReject } from '../test/assert'

class Mock extends BindingInterface {
  isOpen: boolean
  open(_path: string, _options?: OpenOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  close(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  read(_buffer: Buffer, _offset: number, _length: number): Promise<{ buffer: Buffer; bytesRead: number }> {
    throw new Error('Method not implemented.')
  }
  write(_buffer: Buffer): Promise<void> {
    throw new Error('Method not implemented.')
  }
  update(_options: UpdateOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  set(_options: SetOptions): Promise<void> {
    throw new Error('Method not implemented.')
  }
  get(): Promise<PortStatus> {
    throw new Error('Method not implemented.')
  }
  getBaudRate(): Promise<{ baudRate: number }> {
    throw new Error('Method not implemented.')
  }
  flush(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  drain(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

describe('BindingInterface', () => {
  it('throws on unimplemented list', async () => {
    await shouldReject(Mock.list(), Error, 'List should throw if not implemented')
  })
})
