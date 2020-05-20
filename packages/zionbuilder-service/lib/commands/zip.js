module.exports = (options, args) => {
	const fs = require('fs')
	const buildCommand = require('./build')
	const { error, info, done } = require('../util')
	const fse = require('fs-extra')
	const wpPot = require('wp-pot')
	var zip = require('bestzip');
	const { exec } = require("child_process");

	const service = process.ZIONBUILDER_SERVICE

	// Prepare files
	const filesForCopy = [
		...service.options.getOption('zipFiles', []),
		...[
			'languages',
			'assets',
			'dist',
			'includes',
			'vendor/composer',
			'zion-builder.php',
			'manifest.json',
			'Readme.md',
			'readme.txt',
			'vendor/autoload.php'
		]
	]


	function dumpAutoload () {
		exec("composer dump-autoload --no-dev --optimize", (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				return;
			}

			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
		});
		
	}

	function titleCase(str) {
		var splitStr = str.toLowerCase().split(' ');
		for (var i = 0; i < splitStr.length; i++) {
			// You do not need to check if i is larger than splitStr length, as your for does that for you
			// Assign it back to the array
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
		}
		// Directly return the joined string
		return splitStr.join(' ');
	}

	function generateTranslation() {
		// Generate localization strings
		const textDomain = process.env.npm_package_name;
		const filename = `${textDomain}.pot`;
		const packageName = titleCase( textDomain.replace("-", " ") );

		wpPot({
			destFile: `./languages/${filename}`,
			domain: textDomain,
			package: packageName,
			src: `./**/*.php`,
			team: '<hello@hogash.com> Hogash'
		});
		done('Generated localization strings!')
	}

	function createZip() {
		zip({
			source: filesForCopy,
			destination: './zion-builder.zip'
		}).then(function() {
			done('all done!');
		}).catch(function(err) {
			console.error(err.stack);
			process.exit(1);
		});
	}

	return new Promise((resolve, reject) => {
		// Clean dist folder
		if (fs.existsSync('./dist')) {
			fse.removeSync('./dist');
			info('old dist removed')
		}

		info('Building files...')

		// Run build command first so we don't ship with dev files
		buildCommand(options, args).then(() => {
			done('Build files!')

			// Generate translation files
			dumpAutoload()
			generateTranslation()
			createZip()
		})
	})
}