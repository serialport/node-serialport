'use strict'
const Buffer = require('safe-buffer').Buffer
const Transform = require('stream').Transform

/**
 * A transform stream that does something pretty cool.
 * @extends Transform
 * @param {Object} options parser options object
 * @example
// To use the `{{name}}` stream:
const {{pascalCase name}} = require('{{dashCase name}}')
const {{camelCase name}} = new {{pascalCase name}}()
{{camelCase name}}.on('data', console.log)
{{camelCase name}}.write(Buffer.from([1,2,3]))
*/
class {{pascalCase name}} extends Transform {
  constructor (options) {
    super(options)
    // your code here
  }
}

module.exports = {{pascalCase name}}
