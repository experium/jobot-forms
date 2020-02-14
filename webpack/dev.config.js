const webpack = require('webpack');
const path = require('path');

module.exports = {
    output: {
        path: path.resolve(__dirname, '../.tmp'),
        filename: 'app.js',
        publicPath: '/'
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"development"'
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        publicPath: '/',
        contentBase: path.resolve(__dirname, '../.tmp'),
        watchContentBase: true,
        port: 9000,
        historyApiFallback: true
    }
};

