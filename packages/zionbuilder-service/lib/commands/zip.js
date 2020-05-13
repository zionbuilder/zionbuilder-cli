module.exports = (options, args) => {
    const fs = require('fs')
    const buildCommand = require('./build')
    return new Promise((resolve, reject) => {
        // Run build command first so we don't ship with dev files
        buildCommand(options, args).then(() => {
            // create temp folder
            
            // Generate localization strings
            // https://github.com/smhg/gettext-parser

            // Zip temp folder into the main plugin directory
        })
    })
}