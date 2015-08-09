/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';
var webpack = require('webpack');

module.exports = {

  output: {
    filename: 'main.js',
    publicPath: 'assets/'
  },

  cache: true,
  debug: true,
  devtool: false,
  entry: [
      'webpack/hot/only-dev-server',
      './src/components/App.js'
  ],

  stats: {
    colors: true,
    reasons: true
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['web_modules', 'node_modules', 'bower_components'],
    alias: {
      'icons': 'material-ui-mdi/icons',
      "react": __dirname + '/node_modules/react',
      "react/addons": __dirname + '/node_modules/react/addons',
      'styles': __dirname + '/src/styles',
      'mixins': __dirname + '/src/mixins',
      'components': __dirname + '/src/components/',
      'stores': __dirname + '/src/stores/',
      'actions': __dirname + '/src/actions/'
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
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&minetype=application/octet-stream"
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: "file"
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: "url?limit=10000&minetype=image/svg+xml"
    }]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]

};
