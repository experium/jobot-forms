const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'app.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"'
            }
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new CopyWebpackPlugin([
            {
                from: 'demo/index.html',
                to: 'index.html'
            }
        ])
    ]
};
