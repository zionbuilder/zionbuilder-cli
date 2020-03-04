module.exports = (options, args) => {
    return new Promise((resolve) => {
        const gulpTask = require('../../tasks/scripts')

        resolve(gulpTask.build())
    })
}