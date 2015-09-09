/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
var webpack = require('webpack');
var join = require('path').join;

var host = 'localhost';
var port = parseInt(process.env.PORT) + 1 || 3001;

module.exports = {

  output: {
    path: join(__dirname, '.'),
    filename: 'main.js',
    publicPath: '/'
  },

  cache: true,
  debug: true,
  devtool: false,
  entry: [
    'webpack-dev-server/client?' + host + ':' + port,
    'webpack/hot/only-dev-server',
    './editor/main.js'
  ],

  stats: {
    colors: true,
    reasons: true
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      'icons': 'material-ui-mdi/icons',
      'assets': join(__dirname, 'assets'),
      'core': join(__dirname, 'core'),
      'editor': join(__dirname, 'editor'),
      'io': join(__dirname, 'io'),
      'renderer': join(__dirname, 'renderer')
    }
  },
  module: {
    // preLoaders: [{
    //   test: /\.js$/,
    //   exclude: /node_modules/,
    //   loader: 'eslint'
    // }],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'react-hot!babel-loader?stage=1'
    }, {
      test: /\.less/,
      loader: 'style-loader!css-loader!autoprefixer-loader!less-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader!autoprefixer-loader'
    }, {
      test: /\.(png|jpg)$/,
      loader: 'url-loader?limit=8192'
    }, {
      test: /\.(woff)(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&minetype=application/font-woff"
    }, {
      test: /\.(woff2)(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&minetype=application/font-woff2"
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&minetype=image/svg+xml"
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEVTOOLS__: process.env.NODE_ENV !== 'production' && true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]

};
