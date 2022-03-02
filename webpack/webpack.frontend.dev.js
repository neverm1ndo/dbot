const { merge } = require('webpack-merge');
const NodemonPlugin = require('nodemon-webpack-plugin');
const common = require('./webpack.frontend.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
});
