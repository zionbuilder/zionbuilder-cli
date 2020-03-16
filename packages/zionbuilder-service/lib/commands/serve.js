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

        // BrowserSyncPlugin = require('browser-sync-webpack-plugin');

        service.chainWebpack(webpackConfig => {
            webpackConfig.mode('development')

            webpackConfig
                .devtool('cheap-module-eval-source-map')

            webpackConfig
                .plugin('hmr')
                .use(require('webpack/lib/HotModuleReplacementPlugin'))

            // https://github.com/webpack/webpack/issues/6642
            // https://github.com/vuejs/vue-cli/issues/3539
            // webpackConfig
            //     .output
            //     .globalObject(`(typeof self !== 'undefined' ? self : this)`)

            if (options.getOption('progress', true) !== false) {
                webpackConfig
                    .plugin('progress')
                    .use(require('webpack/lib/ProgressPlugin'))
            }

            // webpackConfig
            //     .plugin('browser-sync')
            //     .use(new BrowserSyncPlugin({
            //         files: '**/*.php',
            //         injectChanges: true,
            //     }))
        })

        function addHotClientToEntries(webpackConfig) {
            
            const arr  = []
            arr.concat(webpackConfig).forEach(config => {
                if (typeof config.entry === 'object') {
                    Object.keys(config.entry).forEach(entryName => {
                        const entry = config.entry[entryName]
                        const hotMiddlewareScript = 'webpack-hot-middleware/client?path=http://localhost:' + port +'/__webpack_hmr'
                        config.entry[entryName] = [
                            hotMiddlewareScript,
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
            injectClient: true,
            injectHot: true,
            liveReload: false,
            writeToDisk (filePath) {
                // Only write our own files to disk
                return !/hot-update\.(json|js)$/.test(filePath)
            },
            open: true
        }
        addHotClientToEntries(webpackConfig);

        const compiler = webpack(webpackConfig);
        const WebpackDevMiddleware = require('webpack-dev-middleware')
        const WebpackHotMiddleware = require('webpack-hot-middleware')
        const app = require('express')()


        const devMiddleware = WebpackDevMiddleware(compiler, {
            ...devServerOptions
        })

        // console.log(c.output.path + '\__webpack_hmr')
        const hotMiddleware = WebpackHotMiddleware(compiler, {
            // name: c.name,
            // path: 'dist/__webpack_hmr',
            log: console.log
        });

        app.use(devMiddleware)
        app.use(hotMiddleware)

        // webpackConfig.forEach(c => {
        //     const compiler = webpack(c)
        //     const devMiddleware = WebpackDevMiddleware(compiler, {
        //         ...devServerOptions,
        //         publicPath: c.output.publicPath
        //     })

        //     console.log(c.output.path + '\__webpack_hmr')
        //     const hotMiddleware = WebpackHotMiddleware(compiler, {
        //         name: c.name,
        //         path: c.output.path + '\__webpack_hmr',
        //         log: console.log
        //     });
            
        //     app.use(devMiddleware)
        //     app.use(hotMiddleware)
        //   })
          
          app.listen(port, err => {
            if (err) throw err
            console.log('Compiled successfully!')
            console.log('You can view the application in browser.')
            console.log()
            console.log()
            console.log('Local: http://localhost:' + port)
          })
        return

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