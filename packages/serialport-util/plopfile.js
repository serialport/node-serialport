	module.exports = function (plop) {
	  plop.setGenerator('package', {
	    description: 'Make a new Stream package',

	    // inquirer prompts
	    prompts: [{
	      type: 'input',
	      name: 'name',
	      message: 'Stream name: '
	    }],

	    // actions to perform
	    actions: [{
				type: 'addMany',
				destination: 'packages/{{dashCase name}}/',
	      templateFiles: '.generators/*',
      }]
	  })
	}
