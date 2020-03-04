const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const service = process.ZIONBUILDER_SERVICE;

module.exports = {
    mode: 'production',
    context: service.context,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/wp-content/themes/zionbuilder/dist',
        filename: 'main.js'
    },
    plugins: [
        new MiniCssExtractPlugin()
    ],
    module: {
        rules: [
            { 
                test: /\.js$/, 
                exclude: /node_modules/,
                use: [
                    {
                        loader: require.resolve('babel-loader')
                    }
                ]
            },
        ]
    }
}