/* eslint-disable no-console */
var path = require('path'),
	fs = require('fs'),
	webpack = require('webpack'),
	argv = require('yargs').argv,
	ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

var configfile = path.join(__dirname, 'package.json');
var configobj  = JSON.parse(fs.readFileSync(configfile, 'utf8'));
argv.env = argv.env === 'production'? 'production':'development';

console.log(configobj.name + ' v' + configobj.version + ' (build ' + configobj.build + ')');

var outputDirectory = './www';

var plugins = [
	new webpack.DefinePlugin({
		__DEVELOPMENT__: argv.env === 'development',
		__PRODUCTION__: argv.env === 'production',
		__VERSION__: JSON.stringify(configobj.version),
		__BUILD__: JSON.stringify(configobj.build)
	}),
	new webpack.ResolverPlugin([
		new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('package.json', ['main']),
		new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
	]),
	new ngAnnotatePlugin({
		add: true
	}),
	new webpack.ProvidePlugin({
		$: 'jquery',
		jQuery: 'jquery',
		'window.jQuery': 'jquery',
		Promise: 'es6-promise-promise'
	}),
	new webpack.optimize.CommonsChunkPlugin({
		name: 'vendor',
		filename: 'vendor.bundle.js',
		minChunks: Infinity
	}),
	new webpack.optimize.CommonsChunkPlugin({
		children: true,
		async: true
	})
];

if (argv.env !== 'development') {
	plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));
	plugins.push(new webpack.optimize.DedupePlugin());
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		mangle: {
			except: [ '$super', '$', 'jQuery', 'exports', 'require', 'angular', 'ionic' ]
		}
	}));
}

var options = {
	entry: {
		vendor: [
			'es5-shim',
			'classlist',
			'winstore-jscompat/winstore-jscompat',
			'ionic/js/ionic',
			'angular',
			'angular-animate',
			'angular-sanitize',
			'angular-ui-router',
			'ionic/js/ionic-angular',
			'ngCordova'
		],
		app: [
			'./lib/index'
		]
	},
	output: {
		path: outputDirectory,
		filename: '[name].bundle.js',
		chunkFilename: '[chunkhash].bundle.js'
	},
	resolve: {
		alias: {
			'ionic-filter-bar': 'ionic-filter-bar/dist/ionic.filter.bar'
		},
		root: [
			path.resolve(__dirname, 'bower_components')
		]
	},
	module: {
		preLoaders: [
		  {
          test: /\.js$/,
          loaders: ['eslint']
        }
      ],
		loaders: [
			{
				test: /\.css$/,
				loader: 'style!css',
				include: [
					path.resolve(__dirname, 'lib/css')
				]
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass']
			},
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/vnd.ms-fontobject'
			},
			{
				test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/x-font-opentype'
			},
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/octet-stream'
			},
			{
				test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				/*loader: 'url?limit=10000&mimetype=image/svg+xml'*/
				loader: 'file'
			},
			{
				test: /\.(jpe?g|png|gif)$/i,
				loader: 'file'
			},
			{
				test: /[\/]lokijs\.js$/,
				loader: 'imports?exports=>false&define=>false!exports?loki'
			},
			{
				test: /[\/]angular\.js$/,
				loader: 'expose?angular!exports?angular'
			},
			{
				test: /[\/]ionic\.js$/,
				loader: 'expose?ionic!exports?ionic'
			}
		]
	},
	plugins: plugins,
	externals: {
		fs: '{}',
		cordova: '{}'
	}
};

if (argv.env === 'development') {
	options.output.pathinfo = true;
	options.devtool = 'eval';
}

module.exports = options;
