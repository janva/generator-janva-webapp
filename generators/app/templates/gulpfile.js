//TODO:clean up
const appName = 'get from package.json would be nice';

// file handling helpers
const del = require('del');

// gulp interface
const gulp = require('gulp');

// js-scripts
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const lintJs = require('gulp-eslint');

// style hmm  going for less
const less = require('gulp-less');
const minifyCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');

// bower dependency 
const wiredep = require('gulp-wiredep');

// live reload in browser sync
const bSync = require('browser-sync');
const reload = bSync.reload;

// TODO: concat, uglify, transpile babel
// TODO: pump instead of pipe 
gulp.task('js-scripts', () => {
    return gulp.src('app/scripts/**/*.js')
        // inject bower dependencies
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

// using less 
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
gulp.task('js-lint', () => {
    return gulp.src(['**/*.js', '!node_modules/**', '!bower_components/**'])
        .pipe(lintJs());
});
gulp.task('clean', () => {
    return del(['dist']);
});

// just copy for know
gulp.task('html', () => {
    gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('serve', function (done) {
    bSync({
        server: {
            baseDir: ['dist', 'app'],
        },
    });
    done();
});

gulp.task('default',
    gulp.series('clean', 'js-lint',
        gulp.parallel('styles', 'js-scripts'),
        'serve',
        function (done) {
            gulp.watch(
                ['app/scripts/**/*.js'],
                gulp.parallel('js-scripts')
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