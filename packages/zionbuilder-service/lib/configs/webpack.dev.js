const findFreePort = require('find-free-port-sync')
let port = findFreePort()

module.exports = {
    mode: 'development',
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        allowedHosts: ['*'],
        port,
        disableHostCheck: true,
        writeToDisk (filePath) {
            // Only write our own files to disk
            return !/hot-update\.(json|js)$/.test(filePath)
        },
    }
}