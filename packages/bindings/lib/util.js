function promisify(func) {
  if (typeof func !== 'function') {
    throw new Error('"func" must be a function')
  }
  return function(...args) {
    return new Promise((resolve, reject) => {
      args.push((err, data) => {
        if (err) {
          return reject(err)
        }
        resolve(data)
      })
      func(...args)
    })
  }
}

module.exports = {
  promisify,
}
