const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    chat: './src/public/scripts/chat.index.js',
    speaker: './src/public/scripts/speaker.js',
    dash: './src/public/scripts/dashboard.js',
    polyfills: './src/public/scripts/polyfills.js',
    bg: './src/public/scripts/bg.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'public/scripts/[name].bundle.js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/views', to: 'views' },
        { from: './src/public/stylesheets', to: 'public/stylesheets' },
        { from: './src/public/img', to: 'public/img' },
        { from: './src/public/scripts/tmi.min.js', to: 'public/scripts/tmi.min.js' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css|svg|png)$/i,
        use: ['url-loader', 'style-loader', 'css-loader'],
        exclude: /node_modules/,
      },
    ],
  },
};
