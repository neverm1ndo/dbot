const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
    mode: 'production',
    entry: {
      chat: './src/public/scripts/index.js'
    },
    output: {
      path: path.join(__dirname, 'src/'),
      publicPath: '/',
      filename: 'public/scripts/[name].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(css|svg|png)$/i,
          use: ['url-loader', 'style-loader', 'css-loader'],
        },
      ],
    },
};
