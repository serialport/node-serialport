const arch = require('os').arch();
const fs = require('fs');

if (arch === 'ia32') {
	var contents = fs.readFileSync('binding.gyp', 'utf8').toString();
	if (!contents.match(/v8_enable_pointer_compression/)) {
		console.log('adding')
		contents = contents.replace("'targets':", `
  \'variables\'\: {
    \'v8_enable_pointer_compression%\'\: 0,
    \'v8_enable_31bit_smis_on_64bit_arch\'\: 1,
  },
  \'targets\'\:`)
		console.log(contents)
		fs.writeFileSync('binding.gyp', contents);
	}
	
}
