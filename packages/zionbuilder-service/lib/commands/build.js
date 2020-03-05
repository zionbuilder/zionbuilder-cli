const {
    info,
    done
} = require('../util')

module.exports = (options, args) => {
    const service = process.ZIONBUILDER_SERVICE
    console.log(info)
    return new Promise((resolve) => {
        const gulpTask = require('../../tasks/scripts')

        info('ZionBuilder Service is building files.')

        gulpTask.build()

        // Webpack
        const webpackConfig = service.resolveWebpackConfig()

        const formatStats = require('../util/formatStats')
        webpack(webpackConfig, (err, stats) => {
            if (err) {
                return reject(err)
            }
        
            if (stats.hasErrors()) {
                return reject(`Build failed with errors.`)
            }
        
            if (!args.silent) {
                const targetDirShort = path.relative(
                    service.context,
                    targetDir
                )
                
                console.log(formatStats(stats, targetDirShort, service))
                if (args.target === 'app' && !isLegacyBuild) {
                    if (!args.watch) {
                        done(`Build complete.`)
                    }
                }
            }
            
            resolve()
        })

        resolve()
    })
}