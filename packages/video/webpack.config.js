const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/',
        filename: 'video.js',
        libraryExport: 'default',
        library: 'ZBVideo',
        libraryTarget: 'umd',
    },
    devServer: {
        contentBase: 'demo/'
    },
    module: {
        rules: [
            { 
                test: /\.js$/, 
                exclude: /node_modules/, 
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    }
}