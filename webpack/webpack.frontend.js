const path = require('path');
const PugPlugin = require('pug-plugin');

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
      '@chat': path.resolve(__dirname, '../src/frontend/app/chat'),
    },
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    publicPath: '/',
    filename: 'scripts/[name].js',
    chunkFilename: '[id].[chunkhash].js'
  },
  plugins: [
    new PugPlugin({
      pretty: true, // formatting HTML, useful for development mode
      js: {
        // output filename of extracted JS file from source script
        sourceMap: false,
        filename: 'scripts/[name].js',
      },
      css: {
        // output filename of extracted CSS file from source style
        filename: '[name].[contenthash:8].css',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        loader: '@webdiscus/pug-loader',
        options: {
          method: 'compile', // compile Pug into template function
        },
      },
      {
        test: /\.css|scss$/i,
        use: [
          // MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: true, sourceMap: true }},
          { loader: 'sass-loader' }
        ],
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets',
          modules: {
            namedExport: true,
          },
        }
      },
    ],
  },
};
