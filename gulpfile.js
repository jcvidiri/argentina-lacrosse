var gulp = require('gulp'),
    clean      = require('gulp-clean'),
    minifyCss  = require('gulp-cssnano'),
    minifyJs   = require('gulp-uglify'),
    minifyImgs = require('gulp-imagemin'),

    imagemin   = require('imagemin'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminPngquant = require('imagemin-pngquant'),

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
    .pipe(gulp.dest());
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

gulp.task('images', function() {
  imagemin(['images/*.{jpeg,png}'], 'build/images', { plugins: [imageminMozjpeg(), imageminPngquant({quality: '65-80'})] })
    .then( function() {
      imagemin(['images/portfolio/*.{jpeg,png}'], 'build/images/portfolio', { plugins: [imageminMozjpeg(), imageminPngquant({quality: '65-80'})] })
      .then( function() {
        imagemin(['images/portfolio/modals/*.{jpeg,png}'], 'build/images/portfolio/modals', { plugins: [imageminMozjpeg(), imageminPngquant({quality: '65-80'})] })
        .then( function() {
          imagemin(['images/teams/*.{jpeg,png}'], 'build/images/teams', { plugins: [imageminMozjpeg(), imageminPngquant({quality: '65-80'})] });
      })
    })
  })

});

gulp.task('clean-directories', function() {
  return gulp.src(['build/css', 'build/js'], { read: false })
    .pipe(clean());
});

gulp.task('prepare-libs', ['js-libs', 'css-libs', 'css-custom', 'js-custom', 'images']);

gulp.task('build', ['clean-directories', 'prepare-libs'], function() {
  return gulp.src(files.home)
    .pipe(inject(gulp.src([minifiedFiles.lib, minifiedFiles.custom], { read: false, cwd: __dirname + '/build' }), { addRootSlash: false }))
    .pipe(rename('index.html'))
    .pipe(minifyHTML({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
});
