const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'raw': './src/raw.js'
    },
    output: {
        path: path.resolve(__dirname, '_'),
        publicPath: '/_/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devServer: {
        inline: false,
        hot: false,
        hotOnly: false,
        noInfo: false
    }
};
