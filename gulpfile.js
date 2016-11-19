var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var scss = require('postcss-scss');
var autoprefixer = require('autoprefixer');
var postcssProcessors = [
	autoprefixer( {
		browsers: 'last 2 versions'
	} )
];

var sassMainFile = 'sass/main.scss';
var sassFiles = 'sass/**/*.scss';

gulp.task('css', function() {
	gulp.src(sassMainFile)
		// PostCSS
		.pipe(
			postcss(postcssProcessors, {syntax: scss})
		)
		// SASS to CSS
		.pipe(
			sass({ outputStyle: 'compressed' })
			.on('error', gutil.log)
		)
		.pipe(gulp.dest('dest/assets/css'));
});

var uglify = require('gulp-uglify');
var jsFiles = 'scripts/**/*.js';

gulp.task('js', function() {
	gulp.src(jsFiles)
		.pipe(uglify())
		.pipe(gulp.dest('dest/assets/js'));
});

var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data');

var eventsData = require('./data/events.json');
var moment = require('moment');
var manageEnvironment = function(environment) {
	environment.addFilter('date', function(rawDate) {
		rawDate = rawDate.split('-');
		var year = rawDate[0];
		var month = rawDate[1];
		var day = rawDate[2];
		var m = moment().year(year).month(month).date(day);
		m = m.calendar(null, {
			sameElse: 'dddd Do MMMM YYYY'
		});
		return m;
	});

	environment.addFilter('time', function(rawTime) {
		rawTime = rawTime.split(':');
		var hours = rawTime[0];
		var minutes = rawTime[1];
		var m = moment().hours(hours).minutes(minutes);
		m = m.format('h:mma');
		return m;
	});

	environment.addGlobal('globalTitle', 'My global title');
};

gulp.task('nunjucks', function() {
	return gulp.src('templates/*.nunjucks')
		.pipe(
            data(function() { return eventsData; })
            .on('error', gutil.log)
        )
		.pipe(
		nunjucksRender({
			path: ['templates/layouts/'],
			manageEnv: manageEnvironment
		})
		.on('error', gutil.log)
		)
		.pipe(gulp.dest('dest/'));
});

var browserSync = require('browser-sync');
gulp.task('connectWithBrowserSync', function() {
	browserSync.create();
	browserSync.init({
		server: './dest'
	});
});
gulp.task('watch', function() {
	gulp.watch(sassFiles,['css']).on('change', browserSync.reload);
	gulp.watch(jsFiles,['js']).on('change', browserSync.reload);
	gulp.watch(['**/*.nunjucks', 'events.json'], ['nunjucks']).on('change', browserSync.reload);
});
gulp.task('default', ['connectWithBrowserSync', 'css', 'js', 'nunjucks', 'watch']);