const fs = require('fs')
const files = fs.readdirSync(__dirname).filter(file => file !== 'index.js' && file.match(/\.js$/))
files.forEach(file => require(`./${file}`))
