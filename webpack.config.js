'use strict';

const path = require('path');

module.exports = {
    devServer: { contentBase: './' },
    entry: './src/js/index.js',
    module: {
        loaders: [
            {
                loader: 'marko-loader',
                test: /\.marko/,
            },
        ],
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /.marko$/,
                use: ['marko-loader'],
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist', 'js'),
    },
    resolve: {
        extensions: [
            '.js',
            '.marko',
        ],
    },
};
