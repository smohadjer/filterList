const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const runSequence = require('run-sequence');
const rename = require("gulp-rename");
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('babel', () =>
	gulp.src('src/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
				presets: ['env']
			}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
);

gulp.task('compress', () => {
	gulp.src('dist/*.js')
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'))
});

gulp.task('watches6', () => {
	watch('src/*.js', batch(function (events, done) {
		gulp.start('babel', done);
	}));
});

gulp.task('serve', function(callback) {
	runSequence(
		['babel'],
		['watches6'],
		callback);
});

gulp.task('build', function(callback) {
	runSequence(
		['babel'],
		['compress'],
		callback);
});