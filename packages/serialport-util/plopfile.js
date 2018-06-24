	module.exports = function (plop) {
	  plop.setGenerator('package', {
	    description: 'Make a new project',

	    // inquirer prompts
	    prompts: [{
	      type: 'input',
	      name: 'name',
	      message: 'Project name: '
	    }],

	    // actions to perform
	    actions: [{
				type: 'addMany',
				destination: 'packages/{{dashCase name}}/',
	      templateFiles: '.generators/*',
      }]
	  })
	}
