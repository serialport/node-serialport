// Mocks fs.read for listLinux

import { EventEmitter } from 'events'
import { Readable } from 'stream'
import { linuxList } from '../linux-list'

export const mockLinuxList = (mockUDevOutput: string) => {
  return linuxList(() => {
    const mockUDevAdm = new EventEmitter() as any
    const stream = new Readable({ read() {} })
    mockUDevAdm.stdout = stream
    stream.push(mockUDevOutput)
    stream.push(null)
    return mockUDevAdm
  })
}

export const mockLinuxListError = (code: string) => {
  return linuxList(() => {
    const mockUDevAdm = new EventEmitter() as any
    mockUDevAdm.stdout = new Readable({ read() {} })
    setImmediate(() => {
      mockUDevAdm.emit('close', code)
    })
    return mockUDevAdm
  })
}
