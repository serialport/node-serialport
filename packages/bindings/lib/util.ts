// tslint:disable:readonly-array
export function promisify(func: (...args: any[]) => void) {
  if (typeof func !== 'function') {
    throw new Error('"func" must be a function')
  }
  return (...args: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      args.push((err: Error, data: any) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
      func(...args)
    })
  }
}
