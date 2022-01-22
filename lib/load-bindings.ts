import nodeGypBuild from 'node-gyp-build'
import { promisify } from 'util'
import { join } from 'path'

const binding = nodeGypBuild(join(__dirname, '../')) as any

export const asyncClose = binding.close ? promisify(binding.close) : async () => { throw new Error('"binding.close" Method not implemented')}
export const asyncDrain = binding.drain ? promisify(binding.drain) : async () => { throw new Error('"binding.drain" Method not implemented')}
export const asyncFlush = binding.flush ? promisify(binding.flush) : async () => { throw new Error('"binding.flush" Method not implemented')}
export const asyncGet = binding.get ? promisify(binding.get) : async () => { throw new Error('"binding.get" Method not implemented')}
export const asyncGetBaudRate = binding.getBaudRate ? promisify(binding.getBaudRate) : async () => { throw new Error('"binding.getBaudRate" Method not implemented')}
export const asyncList = binding.list ? promisify(binding.list) : async () => { throw new Error('"binding.list" Method not implemented')}
export const asyncOpen = binding.open ? promisify(binding.open) : async () => { throw new Error('"binding.open" Method not implemented')}
export const asyncSet = binding.set ? promisify(binding.set) : async () => { throw new Error('"binding.set" Method not implemented')}
export const asyncUpdate = binding.update ? promisify(binding.update) : async () => { throw new Error('"binding.update" Method not implemented')}
export const asyncRead = binding.read ? promisify(binding.read) : async () => { throw new Error('"binding.read" Method not implemented')}
export const asyncWrite = binding.read ? promisify(binding.write) : async () => { throw new Error('"binding.write" Method not implemented')}
