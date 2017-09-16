/* eslint-disable no-process-env */

'use strict';

const path = require('path');

const dist = path.resolve(__dirname, 'dist');

module.exports = {
    entry: './src/index.js',
    module: {
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
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: { url: false },
                    },
                    'resolve-url-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ['file-loader'],
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: dist,
    },
    resolve: {
        extensions: [
            '.js',
            '.marko',
        ],
    },
};
