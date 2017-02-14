/*!
 * gulp
 * $ npm install gulp-sass gulp-autoprefixer gulp-minify-css gulp-jshint gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */
// Load plugins
var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	del = require('del');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('sass', function() {
	return gulp.src('scss/*.scss')  //源文件地址
	.pipe(sass().on('error', sass.logError))		//插件
	.pipe(gulp.dest('css')) //生成文件地址
	.pipe(rename({ suffix: '.min' }))
	.pipe(minifycss()) //压缩插件
	.pipe(gulp.dest('css'))
	.pipe(notify({ message: 'Sass task complete' }));
});

gulp.task('serve',['sass'], function() {
    browserSync.init({
        server: "./"
    });
    gulp.watch("scss/*.scss", ['sass']);
    gulp.watch(["*.html","page/*.html","css/*.css","js/*.js"]).on('change', reload);
});

gulp.task('clean', function(cb) {
	return del(['css/*'], cb)
});
gulp.task('run', ['clean'], function() {
	gulp.start('serve');
});
