var gulp   = require('gulp'),
    gutil  = require('gulp-util'),
    jshint = require('gulp-jshint'),
    less   = require('gulp-less'),
    minify = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');
    
gulp.task('lint', function() {
  return gulp.src(['src/js/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('less', function() {
  return gulp.src('src/less/timeline.less')
    .pipe(less({
      //sourceMap: true,
      //compress: true
    }))
    .on('error', gutil.log)
    .on('error', gutil.beep)
    .pipe(concat('timeline.min.css'))
    .pipe(gulp.dest('out/css'));
});

gulp.task('scripts', function() {
  return gulp.src([
      'src/js/*.js',
    ])
    .pipe(concat('timeline.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('out/js'));
});

gulp.task('watch', function() {
  gulp.watch(['src/js/*.js',], ['lint', 'scripts']);
  gulp.watch(['src/less/*.less', 'assets/less/*/*.less'], ['less']);
});

gulp.task('default', ['lint', 'scripts', 'less']);