const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPugPlugin = require('html-webpack-pug-plugin');
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
    },
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    publicPath: '/',
    filename: 'scripts/[name].[chunkhash].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: '../assets', to: 'assets' },
      ],
    }),
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
        test: /\.(png|svg|jpg|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [
          { loader: "style-loader", options: { injectType: "linkTag" }},
          { loader: "file-loader" },
        ],
      },
    ],
  },
};
