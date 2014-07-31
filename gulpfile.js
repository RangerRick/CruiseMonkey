var gulp = require('gulp');

var $ = require('gulp-load-plugin')({camelize: true});
var server = $.tinyLr();

gulp.task('styles', function() {
	return gulp.src('app/styles/cruisemonkey.scss')
	.pipe($.sass({
		style: 'expanded',
		loadPath: ['app/bower_components']
	}))
	.pipe($.livereload(server))
	.pipe($.autoprefixer('last 1 version'))
	.pipe($.csso())
	.pipe(gulp.dest('dist/styles'))
	.pipe($.size());
});

gulp.task('scripts', function() {
	return gulp.src('app/scripts/**/*.js')
	.pipe($.jshint('.jshintrc'))
	.pipe($.jshint.reporter('default'))
	.pipe($.concat('cm.js'))
	.pipe($.livereload(server))
	.pipe($.uglify())
	.pipe(gulp.dest('dist/scripts'))
	.pipe($.size());
});


gulp.task('images', function () {
	return gulp.src('app/images/**/*')
	.pipe($.livereload(server))
	.pipe($.cache($.imagemin({
		optimizationLevel: 3,
		progressive: true,
		interlaced: true
	})))
	.pipe(gulp.dest('dist/images'))
	.pipe($.size());
});

gulp.task('watch', function () {
	// Listen on port 35729
	server.listen(35729, function (err) {
		if (err) {
			return console.error(err);
		};

		// Watch .html files
		gulp.watch('app/*.html');

		// Watch .scss files
		gulp.watch('app/styles/**/*.scss', ['styles']);

		// Watch .js files
		gulp.watch('app/scripts/**/*.js', ['scripts']);

		// Watch image files
		gulp.watch('app/images/**/*', ['images']);
	});
});

gulp.task('clean', function () {
	return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false}).pipe($.clean());
});

gulp.task('build', ['html', 'styles', 'scripts', 'images']);

// Default task
gulp.task('default', ['clean'], function () {
	gulp.start('build');
});
