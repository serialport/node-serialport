// tslint:disable:no-var-requires
import debug from 'debug'
import { WindowsBinding } from './win32'
import { LinuxBinding } from './linux'
import { DarwinBinding } from './darwin'
import { AbstractBinding } from '@serialport/binding-abstract'
const logger = debug('serialport/bindings')

// tslint:disable-next-line:variable-name
let Binding: AbstractBinding
switch (process.platform) {
  case 'win32':
    logger('loading WindowsBinding')
    Binding = WindowsBinding
    break
  case 'darwin':
    logger('loading DarwinBinding')
    Binding = DarwinBinding
    break
  default:
    logger('loading LinuxBinding')
    Binding = LinuxBinding
}

export { Binding }
