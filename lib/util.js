'use strict';

function promisify(func) {
  if (typeof func !== 'function') {
    throw new Error('"func" must be a function');
  }
  return function() {
    return new Promise((resolve, reject) => {
      const args = Array.prototype.slice.apply(arguments);
      args.push((err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
      func.apply(null, args);
    });
  };
}

module.exports = {
  promisify
};
