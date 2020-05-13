module.exports = (options, args) => {
    const fs = require('fs')
    const buildCommand = require('./build')
    const { error, info, done } = require('../util')

    return new Promise((resolve, reject) => {
        info('Building files...')

        // Run build command first so we don't ship with dev files
        buildCommand(options, args).then(() => {
            done('Build files...')

            // create temp folder
            
            // Generate localization strings
            // https://github.com/smhg/gettext-parser

            // Zip temp folder into the main plugin directory
        })
    })
}