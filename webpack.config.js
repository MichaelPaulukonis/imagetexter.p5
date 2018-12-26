const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const loader = require('./loadImages.js')
const images = loader('./assets/images')

module.exports = {
  entry: {
    bundle: path.resolve(__dirname, 'src', 'index.js')
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8080,
    open: true,
    openPage: '',
    stats: 'normal',
  },
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[chunkhash].js'
  },
  resolve: {
    extensions: [
      '.js'
    ],
    // alias: {
    //   Assets: path.resolve(__dirname, 'assets/')
    // }
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
      inject: 'body',
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'assets'),
        to: path.resolve(__dirname, 'dist', 'assets'),
      }
    ]),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor',
    //   minChunks: function (module) {
    //     return module.context && module.context.indexOf('node_modules') !== -1;
    //   },
    // }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'manifest'
    // }),
  ],
  // devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
