const { merge } = require('webpack-merge');
const common = require('./webpack.frontend.js');

module.exports = merge(common, {
  mode: 'production',
});
