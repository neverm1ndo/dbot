const  { merge } = require('webpack-merge');
const common = require('./webpack.backend.js');
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new Dotenv({
      path: './src/pre-start/env/development.env',
    })
  ],
})
