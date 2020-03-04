module.exports = (options, args) => {
    return new Promise((resolve) => {
        const gulpTask = require('../../tasks/watch')

        resolve(gulpTask.default())
    })
}