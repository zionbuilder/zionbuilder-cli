
const { watch, series } = require('gulp')

function watchTask () {
	const chalk = require('chalk')
	const service = process.ZIONBUILDER_SERVICE
	const options = service.options
	const { elementScriptsTask } = require('./scripts')

	console.log( chalk.blue('ZionBuilder Service is watching element scripts.') )

	const elementsFolder = options.getOption('elementsFolder')
	watch(`${elementsFolder}/**/src/element.js`, elementScriptsTask)
}

exports.default = series(watchTask)