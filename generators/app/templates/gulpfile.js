// TODO:clean up for instance runsequnce seems to provide 
// cleaner syntax than gulp.series....
const appName = 'get from package.json would be nice';

// Gulp interface
const gulp = require('gulp');


// File handling helpers
const del = require('del');
const slash = require('slash');
const path = require('path');

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
// no need to wire any more since all js bundled in single 
// file which we serve from as well. Still effective since 
// using timestamps and build cache
// const wiredep = require('gulp-wiredep');

// live reload in browser sync
const bSync = require('browser-sync');
const reload = bSync.reload;

// Incremental builds 
const cached = require('gulp-cached');
const remember = require('gulp-remember');

// Unuglified sources in dev tools
const sourcemaps = require('gulp-sourcemaps');


// command line arguments --env=prod
const args = require('yargs').argv;

// Separate  production build from dev build (--env=prod)
let isprod = (args.env === 'prod');

// Noop will allow use to skips stages when we 
// build to deploy  production  hmm noop assembler 
// desing pattern null object in command pattern...
const through = require('through2');

const noop = () => {
  return through.obj();
};
// hmm so return "emtpy" pipe if isprod = true
// allows to skip stage for production
const dev = function (task) {
  return isprod ? noop() : task;
};

// This is just the negation of dev
const prod = (task) => {
  return isprod ? task : noop();
};
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
  return gulp.src(jsFilesGlob, {
      since: gulp.lastRun('scripts:js'),
    })
    .pipe(dev(sourcemaps.init()))
    // Only include files newer than those in cache
    .pipe(cached('jsuglies'))
    .pipe(uglify())
    // All files needed at concat stage so pull all 
    // files from cache
    .pipe(remember('jsuglies'))
    .pipe(concat('main.min.js'))
    .pipe(dev(sourcemaps.write('.', {
      sourceRoot: 'js-source',
    })))
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
  // Don't serve when runing deployment
  if (!isprod) {
    bSync({
      server: {
        baseDir: ['dist', 'app'],
      },
    });
  }
  done();
});

//TODO fixme a bit no elegant...
if (!prod) {
  // watch changes to my scripts
  const watcher = gulp.watch(['app/scripts/**/*.js'],

    gulp.parallel('scripts:js'));
  // Highjack watcher to synchronize cache with removal 
  // of files on disc
  // listen to unlink event which fires on file deletion 
  // When file is removed from disc remove it from cache
  // (need to remove it from both plugins) 
  watcher.on('unlink', (filepath) => {
    delete cached.caches['jsuglies'][slash(path.join(__dirname, filepath))];
    remember.forget('jsuglies', slash(path.join(__dirname, filepath)));
  });
}
gulp.task('default',
  gulp.series('clean', 'lint:js',
    gulp.parallel('styles', 'scripts:js'),
    'serve:dist',
    function (done) {
      if (!isprod) {
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
      }
      done();
    }
  )
);
