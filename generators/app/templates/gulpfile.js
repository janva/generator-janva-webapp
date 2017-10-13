// TODO:clean up for instance runsequnce seems to provide 
// cleaner syntax than gulp.series....
const appName = 'get from package.json would be nice';

// File handling helpers
const del = require('del');

// Gulp interface
const gulp = require('gulp');

// Scripts:js
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');

// Style hmm  going for less
const less = require('gulp-less');
const minifyCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');

// Bower dependency 
const wiredep = require('gulp-wiredep');
// Const wiredep = require('wiredep').stream;

// live reload in browser sync
const bSync = require('browser-sync');
const reload = bSync.reload;

// TODO: transpile babel
// TODO: pump instead of pipe? 
gulp.task('scripts:js', () => {
  return gulp.src('app/scripts/**/*.js')
    // Inject bower dependencies
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

// Using less 
gulp.task('styles', () => {
  return gulp.src('app/styles/**/*.less')
    .pipe(less())
    .pipe(minifyCSS({
      compatibility: 'ie8',
    }))
    .pipe(prefix())
    .pipe(gulp.dest('dist/styles'));
});

// TODO: don't lint external dependencies
//        --error reporting 
//        --separte set of rules for dist files
gulp.task('lint:js', () => {
  return gulp.src(['**/*.js', '!node_modules/**', '!bower_components/**'])
    .pipe(eslint());
});
gulp.task('clean', () => {
  return del(['dist']);
});

// Just copy for know
gulp.task('html', () => {
  gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('serve:dist', function (done) {
  bSync({
    server: {
      baseDir: ['dist', 'app']
    }
  });
  done();
});

gulp.task('default',
  gulp.series('clean', 'lint:js',
    gulp.parallel('styles', 'scripts:js'),
    'serve:dist',
    function (done) {
      gulp.watch(
        ['app/scripts/**/*.js'],
        gulp.parallel('scripts:js')
      );
      gulp.watch(
        'app/styles/**/*.less',
        gulp.parallel('styles')
      );
      gulp.watch(
        'dist/**/*',
        reload
      );
      done();
    }
  )
);
