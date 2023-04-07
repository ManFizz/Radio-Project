'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const pug = require('gulp-pug');
const browsersync = require('browser-sync').create();

//Create Tree
gulp.task('tree', function(){
  return gulp.src('*.*',{read: false})
    .pipe(gulp.dest('./app'))
    .pipe(gulp.dest('./app/pug'))
    .pipe(gulp.dest('./app/sass'))
    .pipe(gulp.dest('./dist'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(gulp.dest('./dist/img'))
    .pipe(gulp.dest('./src'))
})


//Compile sass
gulp.task('sass', function () {
  return gulp.src('app/sass/*.scss')
  .pipe(sass({
    outputStyle: 'compressed'
  }).on('error', sass.logError))
  .pipe(gulp.dest('dist/css'));
});

//Compile pug
gulp.task('pug', function(){
  return gulp.src('app/pug/*.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('dist'));
});

//Force compile pug on build
gulp.task('build', gulp.series(gulp.parallel('pug'), gulp.series('sass')));

//Auto compile pug, sass and src on update
gulp.task('watch', function(){
  gulp.watch('app/pug/**/*.*', gulp.series('pug'));
  gulp.watch('app/sass/**/*.scss', gulp.series('sass'));
  gulp.watch('src/**/*.{png,js,jpg,gif,css}', gulp.series('move-src'));
});

//Update browser on update files
gulp.task('serve', function(){
  browsersync.init({
    server: 'dist'
  });

  browsersync.watch('dist/**/*.*').on('change', browsersync.reload);
});

//Move all files from src to dist folder
gulp.task('move-src', function(){
  return gulp.src('src/**/*.{png,js,jpg,gif,css}')
  .pipe(gulp.dest('dist'));
});


//Main task development
gulp.task('dev', gulp.series('tree', 'move-src', 'build', gulp.parallel('watch', 'serve')));