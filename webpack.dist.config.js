var webpack = require('webpack');
var join = require('path').join

module.exports = {
  output: {
    path: 'dist/',
    filename: 'main.js'
  },

  debug: false,
  devtool: false,
  entry: './editor/main.js',

  stats: {
    colors: true,
    reasons: false
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
    new webpack.optimize.DedupePlugin(),
    // new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      __DEVTOOLS__: false
    })
  ]

};
