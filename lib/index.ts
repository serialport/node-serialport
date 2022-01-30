/* eslint-disable @typescript-eslint/no-var-requires */
import debugFactory from 'debug'
import { BindingInterface } from './binding-interface'
import { DarwinBinding, DarwinPortBinding, DarwinOpenOptions } from './darwin'
import { LinuxBinding, LinuxPortBinding, LinuxOpenOptions } from './linux'
import { WindowsBinding, WindowsPortBinding } from './win32'
const debug = debugFactory('serialport/bindings-cpp')

export * from './darwin'
export * from './linux'
export * from './win32'
export * from './binding-interface'
export * from './errors'

export type AutoDetectTypes = BindingInterface<DarwinPortBinding, DarwinOpenOptions> | BindingInterface<WindowsPortBinding> | BindingInterface<LinuxPortBinding, LinuxOpenOptions>

/**
 * This is an auto detected binding for your current platform
 */
export function autoDetect(): AutoDetectTypes
{
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
