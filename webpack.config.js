const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const loader = require('./loadImages.js')
const images = loader('./assets/images')

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js')
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8085,
    open: true,
    openPage: '',
    stats: 'normal'
  },
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: [
      '.js'
    ]
  },
  module: {
    // loaders: [
    //   {
    //     loader: 'babel-loader',
    //     test: /\.js$/
    //   }
    // ],
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version),
      IMAGES: JSON.stringify(images)
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      inject: 'body'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'assets'),
        to: path.resolve(__dirname, 'dist', 'assets')
      }
    ])
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
