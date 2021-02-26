const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'app.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': '"production"',
                'RECAPTCHA': '"6LeGFW0aAAAAADzkbozlVnpbROvKEBMwc-d4zkMx"'
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'demo/index.html',
                    to: 'index.html'
                },
                {
                    from: 'demo/404.html',
                    to: '404.html'
                }
            ]
        })
    ]
};
