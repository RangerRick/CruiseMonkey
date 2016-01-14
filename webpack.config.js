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
	}),
	new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js') /*,
	new webpack.optimize.CommonsChunkPlugin('about', 'about.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('amenities', 'amenities.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('cordova', 'cordova.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('data', 'data.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('decks', 'decks.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('emoji', 'emoji.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('events', 'events.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('forums', 'forums.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('info', 'info.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('karaoke', 'karaoke.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('login', 'login.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('seamail', 'seamail.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('settings', 'settings.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('twitarr', 'twitarr.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('user', 'user.bundle.js'),
	new webpack.optimize.CommonsChunkPlugin('util', 'util.bundle.js')
	*/
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
		/*
		'about':[
			'./lib/about/Controller',
			'./lib/about/about.html'
		],
		'amenities':[
			'./lib/amenities/Controller',
			'./lib/amenities/amenities.html'
		],
		'cordova':[
			'./lib/cordova/Initializer',
			'./lib/cordova/Notifications'
		],
		'data':[
			'./lib/data/DB',
			'./lib/data/Model',
			'./lib/data/Upgrades'
		],
		'decks':[
			'./lib/decks/Controller',
			'./lib/decks/Service',
			'./lib/decks/list.html'
		],
		'emoji':[
			'./lib/emoji/Emoji',
			'./lib/emoji/emoji.html'
		],
		'events':[
			'./lib/events/Controller',
			'./lib/events/Service',
			'./lib/events/chooser.html',
			'./lib/events/edit.html',
			'./lib/events/list.html'
		],
		'forums':[
			'./lib/forums/Controller',
			'./lib/forums/Service',
			'./lib/forums/list.html',
			'./lib/forums/view.html'
		],
		'info':[
			'./lib/info/help.html',
			'./lib/info/info.html'
		],
		'karaoke':[
			'./lib/karaoke/Controller',
			'./lib/karaoke/list.html'
		],
		'login':[
			'./lib/login/Controller'
		],
		'seamail':[
			'./lib/seamail/Controller',
			'./lib/seamail/New.',
			'./lib/seamail/Service',
			'./lib/seamail/autocomplete-template.html',
			'./lib/seamail/new.html',
			'./lib/seamail/seamail.html',
			'./lib/seamail/seamails.html'
		],
		'settings':[
			'./lib/settings/Controller',
			'./lib/settings/Service',
			'./lib/settings/settings.html'
		],
		'twitarr':[
			'./lib/twitarr/Controller',
			'./lib/twitarr/Service',
			'./lib/twitarr/new.html',
			'./lib/twitarr/stream.html',
			'./lib/twitarr/tweet.html'
		],
		'user':[
			'./lib/user/Detail',
			'./lib/user/User',
			'./lib/user/detail.html'
		],
		'util':[
			'./lib/util/Service',
		],
		*/
		'app': [
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
