/* eslint-disable @typescript-eslint/no-var-requires */
import debugFactory from 'debug'
import { DarwinBinding, DarwinBindingInterface } from './darwin'
import { LinuxBinding, LinuxBindingInterface } from './linux'
import { WindowsBinding, WindowsBindingInterface } from './win32'
const debug = debugFactory('serialport/bindings-cpp')

export * from '@serialport/bindings-interface'
export * from './darwin'
export * from './linux'
export * from './win32'
export * from './errors'

export type AutoDetectTypes = DarwinBindingInterface | WindowsBindingInterface | LinuxBindingInterface

/**
 * This is an auto detected binding for your current platform
 */
export function autoDetect(): AutoDetectTypes {
  switch (process.platform) {
  case 'win32':
    debug('loading WindowsBinding')
    return WindowsBinding
  case 'darwin':
    debug('loading DarwinBinding')
    return DarwinBinding
  default:
    debug('loading LinuxBinding')
    return LinuxBinding
  }
}
