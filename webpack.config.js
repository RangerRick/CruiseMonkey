var path = require('path'),
	webpack = require('webpack'),
	ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

var outputDirectory = './www';

module.exports = {
	entry: {
		'app': './lib/js/cruisemonkey'
	},
	output: {
		path: outputDirectory,
		filename: '[name].js',
		chunkFilename: '[chunkhash].js'
	},
	resolve: {
		/*
		modulesDirectories: [
			'bower_components',
			'node_modules',
		]
		*/
		alias: {
			'ionic-filter-bar': 'ionic-filter-bar/dist/ionic.filter.bar'
		},
		root: [
			__dirname,
			path.resolve(__dirname, 'bower_components/ionic/release/js'),
			path.resolve(__dirname, 'bower_components'),
			path.resolve(__dirname, 'node_modules')
		]
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'style!css'
			},
			{
				test: /\.scss$/,
				loaders: ['style', 'css', 'sass']
			},
			{
				test: /\.(ttf|eot|otf|svg|woff|woff2)\b/,
				loader: 'file?prefix=font/'
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
				test: /[\/]angular-imgcache\.js$/,
				loader: 'imports?ImgCache=imgcache.js'
			},
			{
				test: /[\/]imgcache\.js$/,
				loader: 'expose?ImgCache!exports?ImgCache'
			},
			{
				test: /[\/]ionic\.js$/,
				loader: 'expose?ionic!exports?ionic'
			}
		]
	},
	plugins: [
		new webpack.ResolverPlugin([
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('package.json', ['main']),
			new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
		]),
		new ngAnnotatePlugin({
			add: true
		}),
		new webpack.ProvidePlugin({
			'$': 'jquery',
			'jQuery': 'jquery',
			'window.jQuery': 'jquery'
		})
		/*
		new webpack.optimize.OccurenceOrderPlugin(true),
		new webpack.optimize.UglifyJsPlugin({
			mangle: {
				except: [ '$super', '$', 'jQuery', 'exports', 'require', 'angular', 'ionic' ]
			}
		})
		*/
	],
	externals: {
		fs: '{}',
		cordova: '{}'
	}
};
