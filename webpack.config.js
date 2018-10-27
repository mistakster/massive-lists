const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'immutable': './src/immutable.js',
        'raw': './src/raw.js',
        'render-raw': './src/render-raw.js'
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
    devtool: 'source-map',
    devServer: {
        allowedHosts: [
            '.ngrok.io'
        ],
        inline: false,
        hot: false,
        hotOnly: false,
        noInfo: false
    }
};
