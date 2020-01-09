const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const process = require('process');
const pkginfo = require('./package.json');

const TerserPlugin = require('terser-webpack-plugin');

const configfile = path.join(__dirname, 'package.json');
const configobj  = JSON.parse(fs.readFileSync(configfile, 'utf8'));
const argv = require('yargs').argv;
// const cloneDeep = require('lodash').cloneDeep;

const mode = argv.mode ? argv.mode : 'development';

// process.exit(0);

module.exports = {
  entry: {
    'app.bundle': path.join(__dirname, 'lib', 'index'),
  },
  mode: mode,
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, 'www'),
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery',
        }],
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: '$',
        }],
      },
      {
        test: /\.html$/,
        use: [
          'ngtemplate-loader',
          'html-loader',
        ],
        exclude: [/node_modules/],
      },
      {
        test: /\.(ttf|otf|eot|woff2?|svg)(\?v=.+)?$/,
        use: [ 'url-loader' ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            limit: 8000,
            name: 'images/[hash]-[name].[ext]',
          }
         }],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /(\.(t|j)sx?)$/,
        use: [
          /*'cache-loader',*/
          'babel-loader'
        ],
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    descriptionFiles: [
      'package.json',
      'bower.json',
    ],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
      path.resolve('./bower_components'),
    ],
    alias: {
      'ionic-filter-bar': 'ionic-filter-bar/dist/ionic.filter.bar',
    },
    extensions: ['.webpack.js', '.web.js', '.ts', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEVELOPMENT__: mode === 'development',
      __PRODUCTION__: mode === 'production',
      __VERSION__: JSON.stringify(configobj.version),
      __BUILD__: JSON.stringify(configobj.build)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
  ],
  node: {
    fs: 'empty',
    __dirname: true,
    child_process: false,
    global: true,
    process: false
  }
};

if (mode === 'production') {
  console.log('Webpack is in "production" mode.');
  module.devtool = undefined;
  module.exports.optimization = {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          mangle: {
            keep_classnames: true,
            keep_fnames: true,
            reserved: [ '$element', '$super', '$scope', '$uib', '$', 'jQuery', 'exports', 'require', 'angular', 'ionic', 'cordova' ],
          },
          compress: true,
        }
      }),
    ],
  };
}
