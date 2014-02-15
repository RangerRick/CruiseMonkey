// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/bower_components/jasmine.async/lib/jasmine.async.js',
      'app/scripts/3rdparty/modernizr-latest.js',
      'app/bower_components/log4javascript/log4javascript.js',
      'app/bower_components/momentjs/moment.js',
      'app/scripts/3rdparty/pouchdb-nightly.js',
      'app/scripts/angular-3rdparty/ionic.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-loader/angular-loader.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-touch/angular-touch.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/scripts/angular-3rdparty/ionic-angular.js',
      'app/bower_components/angularLocalStorage/src/angularLocalStorage.js',
      'app/bower_components/angular-bindonce/bindonce.js',
      'app/scripts/cruisemonkey/karaoke-list.js',
      'app/scripts/cruisemonkey/*.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
