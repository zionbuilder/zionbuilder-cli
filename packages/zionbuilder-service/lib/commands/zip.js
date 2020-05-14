module.exports = (options, args) => {
	const fs = require('fs')
	const buildCommand = require('./build')
	const { error, info, done } = require('../util')
	const fse = require('fs-extra')
	const zipFolder = require('zip-a-folder');
	var gettextParser = require("gettext-parser");

	return new Promise((resolve, reject) => {

		if (fs.existsSync('./dist')) {
			fse.removeSync('./dist');
			info('old dist removed')
		}

		info('Building files...')

		// Run build command first so we don't ship with dev files
		buildCommand(options, args).then(() => {
			done('Build files...')
			info('dist built')

			// create temp folder
			var tempDir = './temp'
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir)
				info('temp folder created')
			}
			var vendorDir = './temp/vendor'
			fs.mkdirSync(vendorDir)

			// Generate localization strings
			var input = require('fs').readFileSync('./languages/zion-builder.pot');
			gettextParser.po.parse(input);


			const foldersMove = ['languages', 'assets', 'dist', 'includes', 'php-cs-fixer', 'scripts', 'vendor/composer']
			// copy folders to temp
			foldersMove.forEach(folder => {
				fse.copy(`./${folder}`, `./temp/${folder}`, function (err) {
					if (err) {
						error(err);
					} else {
						info(`folder ${folder} copied`);
					}
				});
			});

			const filesMove = ['zion-builder.php', 'manifest.json', 'zionbuilder.config.js', '.phpcs.xml', 'Readme.md', 'vendor/autoload.php']
			filesMove.forEach(file => {
				//copy files to temp
				fs.copyFile(`./${file}`, `./temp/${file}`, (err) => {
					if (err) {
						error(err)
					}
					else {
						info(`file ${file} copied`);
					}

				});

			});

		})
			.finally(() => {

				const createZip = function () {
					info("zip create");
					// Zip temp folder into the main plugin directory
					zipFolder.zip('./temp', './zion-builder.zip', (err) => {
						if (err) {
							console.log('Something went wrong!', err);
						}
					}).finally(() => {
						info("zip done");
						fse.removeSync('./temp')
						info('old temp removed')
					})
				}

				setTimeout(function () {
					createZip()

				}, 3000);

			});


	})


}