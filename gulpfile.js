'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass')(require('sass'));

const pug = require('gulp-pug');
const browsersync = require('browser-sync').create();

gulp.task('sass', function () {
  return gulp.src('app/sass/*.scss')
  .pipe(sass({
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(gulp.dest('dist/css'));
});

gulp.task('pug', function(){
  return gulp.src('app/pug/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.series(gulp.parallel('pug')));

gulp.task('watch', function(){
  gulp.watch('app/pug/**/*.*', gulp.series('pug'));
  gulp.watch('app/sass/**/*.scss', gulp.series('sass'));
});

gulp.task('serve', function(){
  browsersync.init({
    server: 'dist'
  });

  browsersync.watch('dist/**/*.*').on('change', browsersync.reload);
});


gulp.task('tree', function(){
  return gulp.src('*.*',{read: false})
    .pipe(gulp.dest('./app'))
    .pipe(gulp.dest('./app/pug'))
    .pipe(gulp.dest('./app/scss'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(gulp.dest('./dist/fonts'))
    .pipe(gulp.dest('./dist/img'))
    .pipe(gulp.dest('./src'))
})

gulp.task('dev', gulp.series('tree', 'build', gulp.parallel('watch', 'serve')));