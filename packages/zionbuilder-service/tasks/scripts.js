const { dest, src, series } = require( 'gulp' )
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const chalk = require('chalk')
const path = require('path')
const postcss = require('gulp-postcss');
const insert = require('gulp-insert')
const sass = require('gulp-sass');

const service = process.ZIONBUILDER_SERVICE
const options = service.options

function elementScriptsTask (cb) {

    const elementsFolder = path.relative(service.context, options.getOption('elementsFolder'))
    
    console.log( chalk.blue('Starting elements scripts compilation') )
    
    src(`${elementsFolder}/**/src/element.js`)
        .pipe(babel())
        .pipe(rename(function(file) {
            // Change destination to element folder
            file.dirname = path.join( file.dirname, '..' )
        }))
        .pipe(dest(`${elementsFolder}`))

    cb()
}

function webpack (cb) {
    const elementsFolder = path.relative(service.context, options.getOption('elementsFolder'))
    
    console.log( chalk.blue('Starting webpack service') )

    src(`${elementsFolder}/**/src/frontend.js`)
        .pipe(babel())
        .pipe(rename(function(file) {
            // Change destination to element folder
            file.dirname = path.join( file.dirname, '..' )
        }))
        .pipe(dest('./'))

    cb()
}

exports.build = series(elementScriptsTask);
exports.elementScriptsTask = series(elementScriptsTask);
exports.webpack = series(webpack);