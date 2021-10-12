const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    server: './src/index.ts'
  },
  target: 'node',
  externals: [nodeExternals()],
  externalsPresets: {
      node: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@server': path.resolve(__dirname, 'src/Server'),
      '@schemas': path.resolve(__dirname, 'src/schemas/'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces/'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/',
    filename: 'index.js',
    clean: true
  },
}
