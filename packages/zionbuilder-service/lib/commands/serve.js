module.exports = (options, args) => {
    const service = process.ZIONBUILDER_SERVICE
    const webpack = require('webpack')
    const { error, info, done } = require('../util')
    const port = service.availablePort

    service.chainWebpack(webpackConfig => {
        webpackConfig.mode('development')

        webpackConfig
            .devtool('cheap-module-eval-source-map')
        webpackConfig
            .stats('errors-warnings')

        // https://github.com/webpack/webpack/issues/6642
        // https://github.com/vuejs/vue-cli/issues/3539
        webpackConfig
            .output
            .globalObject(`(typeof self !== 'undefined' ? self : this)`)

        webpackConfig
            .plugin('hmr')
            .use(require('webpack/lib/HotModuleReplacementPlugin'))

        if (options.getOption('progress', true) !== false) {
            webpackConfig
                .plugin('progress')
                .use(require('webpack/lib/ProgressPlugin'))
        }
    })

    const webpackConfig = service.resolveWebpackConfig()
    const devServerOptions = {
        logLevel: 'silent',
        stats: false,
        logTime: false,
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
        writeToDisk (filePath) {
            // Only write our own files to disk
            return !/hot-update\.(json|js)$/.test(filePath)
        }
    }

    const express = require('express');
    const devMiddleware = require('webpack-dev-middleware')
    const hotMiddleware = require('webpack-hot-middleware')
	const path = require('path')
    const app = express();

    function addHotClientToEntries(webpackConfig) {
        const arr  = []
        arr.concat(webpackConfig).forEach(config => {
            if (typeof config.entry === 'object') {
                Object.keys(config.entry).forEach(entryName => {
                    const entry = config.entry[entryName]

                    config.entry[entryName] = [
                        require.resolve(`webpack-hot-middleware/client`) + `?path=_webpack_hmr__&dynamicPublicPath=true&noInfo=true`,
                        entry
                    ]
                })

            }
        })
    }

    webpackConfig.forEach(config => {
        addHotClientToEntries(config)
        const compiler = webpack(config);
        const relativePath = path.relative( service.context, config.output.path )

        app.use(
            devMiddleware(compiler, {
                ...devServerOptions,
                publicPath: service.getPublicPath() + '' + relativePath
            })
        );

        const pathToUrl = relativePath.replace(/\\/g, '/')

        app.use(
            hotMiddleware(compiler, {
                path: `/${pathToUrl}/_webpack_hmr__`,
                log: false
            })
        );

        compiler.hooks.done.tap('zionbuilder-service-serve', stats => {
            if (stats.hasErrors()) {
                return
            }
        })
    })

    const server = app.listen(port, (err) => {
        if (err) {
            error(`Cannot start server on port ${port}`)
            reject(err)
        }

        console.log()
        console.log()
        info(`Dev server is serving files on port ${port}!`)
        console.log()
        console.log()
    })

    const closeServer = function () {
        server.close(() => {
            process.exit(0)
        })
    }

    ;['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
            closeServer()
        })
    })

    if (process.argv.stdin) {
        process.stdin.on('end', () => {
            closeServer()
        })

        process.stdin.resume()
    }

    return new Promise(resolve => {
        resolve({
            server
        })
    })
}