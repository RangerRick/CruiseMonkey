var path = require('path'),
	webpack = require('webpack'),
	argv = require('yargs').argv,
	ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

argv.env = argv.env || 'development';

var outputDirectory = './www';

var plugins = [
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
];

if (argv.env !== 'development') {
	plugins.push(new webpack.optimize.OccurenceOrderPlugin(true));
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		mangle: {
			except: [ '$super', '$', 'jQuery', 'exports', 'require', 'angular', 'ionic' ]
		}
	}));
}

module.exports = {
	entry: {
		'vendor': [
			'es5-shim',
			'classlist',
			'winstore-jscompat/winstore-jscompat',
			'ionic',
			'angular',
			'angular-animate',
			'angular-sanitize',
			'angular-ui-router',
			'ionic-angular',
			'ngCordova'
		],
		'app': [
			'./lib/js/cruisemonkey'
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
			__dirname,
			path.resolve(__dirname, 'bower_components/ionic/release/js'),
			path.resolve(__dirname, 'bower_components'),
			path.resolve(__dirname, 'node_modules')
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
	plugins: plugins,
	externals: {
		fs: '{}',
		cordova: '{}'
	}
};
