const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');

module.exports = {
    mode: 'production',
    entry: {
      app: './src/public/scripts/index.js'
    },
    // plugins: [
    //   new HtmlWebpackPlugin({
    //     template: './src/views/chat.pug',
    //     filename: 'views/chat.pug',
    //     minify: false
    //   }),
    //   new HtmlWebpackPugPlugin()
    // ],
    output: {
      path: path.join(__dirname, 'dist/'),
      publicPath: '/',
      filename: 'public/scripts/[name].bundle.js'
    },
};
