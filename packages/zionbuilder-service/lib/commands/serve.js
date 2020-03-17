module.exports = (options, args) => {
    return new Promise((resolve) => {
        const gulpTask = require('../../tasks/watch')

        // Start gulp watcher
        gulpTask.default()

        // webpack
        const service = process.ZIONBUILDER_SERVICE
        const webpack = require('webpack')
        const chalk = require('chalk')
        const port = service.availablePort

        service.chainWebpack(webpackConfig => {
            webpackConfig.mode('development')

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

        function addHotClientToEntries(webpackConfig) {
            
            const arr  = []
            arr.concat(webpackConfig).forEach(config => {
                if (typeof config.entry === 'object') {
                    Object.keys(config.entry).forEach(entryName => {
                        const entry = config.entry[entryName]
                        config.entry[entryName] = [
                            require.resolve(`webpack-dev-server/client`) + `?http://localhost:${port}/sockjs-node`,
                            require.resolve(`webpack/hot/dev-server`),
                            entry
                        ]
                    })

                }
            })
        }

        const webpackConfig = service.resolveWebpackConfig()
        const webpackDevServer = require('webpack-dev-server')
        const devServerOptions = {
            logLevel: 'silent',
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            allowedHosts: ['*'],
            disableHostCheck: true,
            watchOptions: {
                poll: true
            },
            overlay: {
                warnings: false,
                errors: true
            },
            port,
            hot: true,
            injectClient: false,
            injectHot: false,
            liveReload: false,
            writeToDisk: true,
            inline: true,
            writeToDisk (filePath) {
                // Only write our own files to disk
                return !/hot-update\.(json|js)$/.test(filePath)
            }
        }
        
        addHotClientToEntries(webpackConfig);

        const compiler = webpack(webpackConfig);
        const server = new webpackDevServer(compiler, devServerOptions)

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

            compiler.hooks.done.tap('zionbuilder-service-serve', stats => {
                if (stats.hasErrors()) {
                    return
                }
            })

            resolve({
                compiler
            })

            server.listen(port, 'localhost', err => {
                if (err) {
                    reject(err)
                }
            })
        })
    })
}