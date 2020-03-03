const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './demo/app.js',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                enforce: 'pre',
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    configFile: './.eslintrc',
                    fix: true
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                    plugins: [
                        '@babel/plugin-proposal-class-properties',
                        ["@babel/plugin-transform-runtime",
                            {
                            "regenerator": true
                            }
                        ]
                    ],
                    babelrc: false
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    { loader: 'css-loader', options: {
                        modules: true,
                        importLoaders: 2,
                        modules: {
                            localIdentName: '[name]__[local]___[hash:base64:5]'
                        }
                    }}
                ]
            },
            {
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: 'graphql-tag/loader',
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx', '.css']
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
};
