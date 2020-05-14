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

			//copy languages folder to temp
			fse.copy('./languages', './temp/languages', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder languages copied");
				}
			});

			//copy assets folder to temp
			fse.copy('./assets', './temp/assets', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder assets copied");
				}
			});

			//copy dist folder to temp
			fse.copy('./dist', './temp/dist', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder dist copied");
				}
			});

			//copy includes folder to temp
			fse.copy('./includes', './temp/includes', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder includes copied");
				}
			});

			//copy includes folder to temp
			fse.copy('./php-cs-fixer', './temp/php-cs-fixer', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder php-cs-fixer copied");
				}
			});

			//copy includes folder to temp
			fse.copy('./scripts', './temp/scripts', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder scripts copied");
				}
			});

			//copy vendor folder to temp
			fse.copy('./vendor/composer', './temp/vendor/composer', function (err) {
				if (err) {
					error(err);
				} else {
					info("folder vendor copied");
				}
			});

			//copy files to temp
			fs.copyFile('./zion-builder.php', './temp/zion-builder.php', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

			//copy files to temp
			fs.copyFile('./manifest.json', './temp/manifest.json', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

			//copy files to temp
			fs.copyFile('./zionbuilder.config.js', './temp/zionbuilder.config.js', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

			//copy files to temp
			fs.copyFile('./.phpcs.xml', './temp/.phpcs.xml', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

			//copy files to temp
			fs.copyFile('./Readme.md', './temp/Readme.md', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

			//copy files to temp
			fs.copyFile('./vendor/autoload.php', './temp/vendor/autoload.php', (err) => {
				if (err) {
					error(err)
				}
				else {
					info("files copied");
				}

			});

		})
			.finally(() => {

				const createZip = function () {
					info("zip create");
					// Zip temp folder into the main plugin directory
					zipFolder.zip('./temp', './zion-builder.zip', (err) => { })
				}

				setTimeout(function () { createZip() }, 3000);


			});


	})


}