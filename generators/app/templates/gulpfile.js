// TODO:clean up for instance runsequnce seems to provide 
// cleaner syntax than gulp.series....
const appName = 'get from package.json would be nice';

// File handling helpers
const del = require('del');
const slash = require('slash');
const path = require('path');

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
const mainBowerFiles = require('main-bower-files');
// const wiredep = require('gulp-wiredep');

// live reload in browser sync
const bSync = require('browser-sync');
const reload = bSync.reload;

// Incremental builds 
const cached = require('gulp-cached');
const remember = require('gulp-remember');

// Unuglified sources in dev tools
const sourcemaps = require('gulp-sourcemaps');

// TODO: don't lint external dependencies
//        --error reporting 
//        --separte set of rules for dist files
gulp.task('lint:js', () => {
  return gulp.src(
      ['**/*.js', '!node_modules/**',
        '!bower_components/**',
      ], {
        since: gulp.lastRun('lint:js'),
      })
    .pipe(eslint());
});

// TODO: transpile babel
// TODO: pump instead of pipe? 
// Gulp 4 introduces timestamps (Second arg to src)
// which compares files timestamp and includes it 
// only if newer the task last run 
// introduced build cache. Build cache select files
// based on changes in content not mearly on timestamp. 
gulp.task('scripts:js', () => {
  // Inject bower dependencies
  let jsFilesGlob = mainBowerFiles('**/*.js');
  // Add non vendor scripts
  jsFilesGlob.push('app/scripts/**/*.js');
  console.log('glob: ' + jsFilesGlob);
  return gulp.src(jsFilesGlob, {
      since: gulp.lastRun('scripts:js'),
    })
    .pipe(sourcemaps.init())
    // Only include files newer than those in cache
    .pipe(cached('jsuglies'))
    .pipe(uglify())
    // All files needed at concat stage so pull all 
    // files from cache
    .pipe(remember('jsuglies'))
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.', {
      sourceRoot: 'js-source',
    }))
    .pipe(gulp.dest('dist/scripts'));
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
      baseDir: ['dist', 'app'],
    },
  });
  done();
});

// watch changes to my scripts
const watcher = gulp.watch(['app/scripts/**/*.js'],
  gulp.parallel('scripts:js'));
// highjack watcher to synchronize cache with removal of files on disc
//
// listen to unlink event which fires on filedeletion 
// When file is removed from disc remove it from cache
// (need to remove it from both plugins) 
watcher.on('unlink', (filepath) => {
  console.log('run unlink');
  delete cached.caches['jsuglies'][slash(path.join(__dirname, filepath))];
  remember.forget('jsuglies', slash(path.join(__dirname, filepath)));
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
