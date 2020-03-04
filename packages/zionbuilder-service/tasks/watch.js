const path = require('path')
const chalk = require('chalk')
const { watch, series } = require('gulp')
const webpack = require('webpack')
const merge = require('webpack-merge')

const { elementScriptsTask, elementStylesTask } = require('./scripts')

const service = process.ZIONBUILDER_SERVICE
const options = service.options

function watchTask () {
	console.log( chalk.blue('ZionBuilder Service is watching element scripts.') )

	const elementsFolder = options.getOption('elementsFolder')
	watch(`${elementsFolder}/**/src/element.js`, elementScriptsTask)
	watch(`${elementsFolder}/**/src/element.scss`, elementStylesTask)

	// webpack
	const port = service.availablePort
	service.chainWebpack(webpackConfig => {
		webpackConfig
			.devtool('cheap-module-eval-source-map')

		webpackConfig
			.plugin('hmr')
			.use(require('webpack/lib/HotModuleReplacementPlugin'))

		// https://github.com/webpack/webpack/issues/6642
		// https://github.com/vuejs/vue-cli/issues/3539
		webpackConfig
			.output
			.globalObject(`(typeof self !== 'undefined' ? self : this)`)

		if (options.getOption('progress', true) !== false) {
			webpackConfig
				.plugin('progress')
				.use(require('webpack/lib/ProgressPlugin'))
		}
	})

	const WebpackDevServer = require('webpack-dev-server')
	const webpackConfig = merge(service.resolveWebpackConfig(), {
		mode: 'development'
	})

	const compiler = webpack(webpackConfig)
	const server = new WebpackDevServer(compiler, {
		logLevel: 'silent',
		clientLogLevel: 'silent',
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		allowedHosts: ['*'],
		disableHostCheck: true,
		overlay: {
			warnings: false,
			errors: true
		},
		port,
		injectClient: true,
		hot: true,
		inline: true,
		hotOnly: true,
		writeToDisk (filePath) {
			// Only write our own files to disk
			return !/hot-update\.(json|js)$/.test(filePath)
		},
		publicPath: service.getPublicPath()
	})

	;['SIGINT', 'SIGTERM'].forEach(signal => {
		process.on(signal, () => {
			server.close(() => {
			process.exit(0)
			})
		})
	})

	if (process.argv.stdin) {
		process.stdin.on('end', () => {
			server.close(() => {
			process.exit(0)
			})
		})

		process.stdin.resume()
	}

	return new Promise(resolve => {
		console.log()
		console.log(chalk.blue(`Starting server on http://localhost:${port}`));
		console.log()

		compiler.hooks.done.tap('zionbuilder-service serve', stats => {
			if (stats.hasErrors()) {
				return
			}
		})

		resolve({
			server
		})

		server.listen(port, 'localhost', err => {
			if (err) {
				reject(err)
			}
		})
	})
}

exports.default = series(watchTask)