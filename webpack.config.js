var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // include .js files
        exclude: /node_modules/, // exclude any and all files in the node_modules folder
        use:{ loader: "jshint-loader", options: { esversion: 6, camelcase: true, emitErrors: false, failOnHint: false } }
        },
      {
        use: 'babel-loader',
        test: '/\.js$/',
        exclude: 'node_modules'
      },
      {
        use: ExtractTextPlugin.extract({
          use: 'css-loader'
        }),
        test: /\.css$/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    
    new ExtractTextPlugin('styles.css')
  ]

};