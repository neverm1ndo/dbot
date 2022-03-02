const  { merge } = require('webpack-merge');
const common = require('./webpack.backend.js');
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new Dotenv({
      path: './src/pre-start/env/production.env',
    })
  ],
})
