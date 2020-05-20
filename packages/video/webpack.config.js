const path = require('path');

module.exports = {
    entry: {
        ZBVideo: './src/index.js',
        ZBVideoBg: './src/modules/videoBg.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'dist/',
        filename: '[name].js',
        library: '[name]',
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