const path = require('path');

module.exports = {
    devServer: {
        contentBase: './'
    },
    entry: './src/js/index.js',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist', 'js')
    }
};
