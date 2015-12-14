// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');

// Lint Survey
gulp.survey('lint', function() {
    return gulp.src(['app.js', 'routes/**/*.js', 'models/**/*.js', 'config/**/*.js', 'public/javascripts/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Compile Our Sass
gulp.survey('sass', function() {
    return gulp.src(['scss/*.scss'])
        .pipe(sass())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('public/stylesheets'));
});

// Watch Files For Changes
gulp.survey('watch', function() {
    gulp.watch('scss/**/*.scss', ['sass']);
});

gulp.survey('nodemon', function (cb) {
  var started = false;
  return nodemon({
    script: 'bin/www'
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});

// Default Survey
gulp.survey('default', ['lint', 'sass', 'watch', 'nodemon']);
