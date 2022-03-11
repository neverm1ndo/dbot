const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, '../src/frontend/app'),
  target: 'web',
  entry: {
    index: './index',
    chat: './chat/chat.app',
    speaker: './speaker/speaker',
    dashboard: './dashboard/dashboard',
    commands: './commands/commands',
    polyfills: './polyfills.js',
    bg: './shared/bg.js'
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, '../src/frontend/app'),
      '@shared': path.resolve(__dirname, '../src/frontend/app/shared'),
      '@assets': path.resolve(__dirname, '../src/frontend/assets'),
    },
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    publicPath: '/',
    filename: 'scripts/[name].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './chat/chat.pug',
      filename: '../views/chat.pug',
      minify: false,
      chunks: ['chat', 'polyfills']
    }),
    new HtmlWebpackPlugin({
      template: './index.pug',
      filename: '../views/index.pug',
      minify: false,
      chunks: ['index', 'bg']
    }),
    new HtmlWebpackPlugin({
      template: './dashboard/dashboard.pug',
      filename: '../views/dashboard.pug',
      minify: false,
      chunks: ['dashboard']
    }),
    new HtmlWebpackPlugin({
      template: './speaker/speaker.pug',
      filename: '../views/speaker.pug',
      minify: false,
      chunks: ['speaker']
    }),
    new HtmlWebpackPlugin({
      template: './commands/commands.pug',
      filename: '../views/commands.pug',
      minify: false,
      chunks: ['commands']
    }),
    new HtmlWebpackPugPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, { loader: 'css-loader', options: { url: true, sourceMap: true } }],
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets',
        }
      },
      // {
      //   test: /\.(pug)$/,
      //   loader: 'pug-loader',
      // },
    ],
  },
};
