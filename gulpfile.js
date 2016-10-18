var gulp = require('gulp'),
    clean      = require('gulp-clean'),
    minifyCss  = require('gulp-cssnano'),
    minifyJs   = require('gulp-uglify'),
    minifyImgs = require('gulp-imagemin'),
    rename     = require('gulp-rename'),
    lib        = require('bower-files')(),
    concat     = require('gulp-concat'),
    minifyHTML = require('gulp-htmlmin'),
    wiredep    = require('wiredep').stream,
    inject     = require('gulp-inject');

var timestamp = (new Date()).getTime();

var files = {
    jsMain: 'js/*.js',
    styles: 'css/*.*',
    images: 'images/**/*.*',
    fonts: 'fonts/**/*.*',
    index: 'index.html',
    home:  'home.html',
};

var minifiedFiles = {
  custom: '*/all.*.min.*',
  lib: '*/lib.*.min.*'
};

gulp.task('inject-libs', function() {
  return gulp.src(files.home)
    .pipe(inject(gulp.src([files.jsMain, files.styles], { read: false }), { relative: true }))
    .pipe(wiredep())
    .pipe(rename('index.html'))
    .pipe(gulp.dest('src'));
});

gulp.task('css-custom', function() {
  return gulp.src([files.styles])
    .pipe(concat('all.' + timestamp + '.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('build/css'));
});

gulp.task('js-custom', function() {
  return gulp.src([files.jsMain])
    .pipe(concat('all.' + timestamp + '.min.js'))
    .pipe(minifyJs())
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-libs', function() {
  return gulp.src(lib.ext('js').files)
    .pipe(concat('lib.' + timestamp  + '.min.js'))
    .pipe(minifyJs())
    .pipe(gulp.dest('build/js'));
});

gulp.task('css-libs', function() {
  return gulp.src(lib.ext('css').files)
    .pipe(concat('lib.' + timestamp  + '.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('build/css'));
});

gulp.task('fonts-custom', function() {
  return gulp.src(files.fonts)
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('images', function() {
  return gulp.src(files.images)
    .pipe(minifyImgs())
    .pipe(gulp.dest('build/images'));
});

gulp.task('clean-directories', function() {
  return gulp.src(['build/css', 'build/js'], { read: false })
    .pipe(clean());
});

gulp.task('prepare-libs', ['js-libs', 'css-libs', 'css-custom', 'js-custom', 'fonts-custom', 'images']);

gulp.task('build', ['prepare-libs', 'clean-directories'], function() {
  return gulp.src(files.home)
    .pipe(inject(gulp.src([minifiedFiles.lib, minifiedFiles.custom], { read: false, cwd: __dirname + '/build' }), { addRootSlash: false }))
    .pipe(rename('home.html'))
    .pipe(minifyHTML({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
});
