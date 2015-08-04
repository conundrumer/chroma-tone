/*
 * Webpack development server configuration
 *
 * This file is set up for serving the webpack-dev-server, which will watch for changes and recompile as required if
 * the subfolder /webpack-dev-server/ is visited. Visiting the root will not automatically reload.
 */
'use strict';

var webpack = require('webpack');

var config = require('./webpack.config');
config.plugins.push(new webpack.DefinePlugin({
  'process.env.NODE_ENV': '"production"'
}));

module.exports = config;
