const gulp = require('gulp'),
	babel = require('gulp-babel'),
	uglify = require('gulp-uglify'),
	rename = require("gulp-rename"),
	sourcemaps = require('gulp-sourcemaps'),
	del = require('del'),
	debug = require('gulp-debug');

	var rollup = require('rollup-stream');
	var source = require('vinyl-source-stream');
	var buffer = require('vinyl-buffer');
	const eslint = require('gulp-eslint');

gulp.task('clean:dist', function () {
	return del([
		'./dist/**/*'
	]);
});

gulp.task('lint', () => {
	// ESLint ignores files with "node_modules" paths.
	// So, it's best to have gulp ignore the directory as well.
	// Also, Be sure to return the stream from the task;
	// Otherwise, the task may end before the stream has finished.
	return gulp.src(['src/*.js'])
		// eslint() attaches the lint output to the "eslint" property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failAfterError last.
		.pipe(eslint.failAfterError());
});

gulp.task('babel', () =>
	gulp.src('dist/filterList.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
				presets: ['@babel/preset-env']
			}))
		.pipe(sourcemaps.write('.'))
		.pipe(rename({ suffix: '.es5' }))
		.pipe(gulp.dest('dist'))
);

gulp.task('rollup', function() {
	return rollup({
		input: 'src/filterList.js',
		format: 'iife',
		name: 'FilterList',
		sourcemap: true
	})

		.pipe(source('filterList.js'))
		.pipe(debug({title: 'DEBUG:'}))

		// buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
		.pipe(buffer())

		// tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream.
		.pipe(sourcemaps.init({loadMaps: true}))

		// write the sourcemap alongside the output file.
		.pipe(sourcemaps.write('.'))

		.pipe(gulp.dest('./dist'));
});

gulp.task('compress', () =>
	gulp.src('dist/*.es5.js')
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'))
);

gulp.task('watch', () => {
	gulp.watch('src/*.js', gulp.series('rollup', 'babel'));
});

gulp.task('serve', gulp.series(
	'clean:dist',
	'lint',
	'rollup',
	'babel',
	'watch'
));

gulp.task('build', gulp.series(
	'clean:dist',
	'rollup',
	'babel',
	'compress'
));
