const
    {src, dest, parallel, series, watch} = require('gulp'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    nano = require('gulp-clean-css'),
    pug = require('gulp-pug'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync');

const
    path = {
        project: './',
        pug: 'src/pug/index.pug',
        css: 'css/',
        sass: 'src/sass/**/*.sass'
    };

function css() {
    return src(path.sass)
        .pipe(plumber())
        .pipe(sass({}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(sourcemaps.init())
        .pipe(nano())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.css))
};

function browserReload() {
    browserSync.init(
        {
            server: {
                baseDir: "./"
            },
            // proxy: {
            //     target: 'https://arena.loc/',
            // },
            files: [path.sass, path.pug],
            port: 3002,
            https: {
                key: "../../../userdata/config/cert_files/server.key",
                cert: "../../../userdata/config/cert_files/server.crt",
            },
            notify: false
        }
    );
};

function buildHTML() {
    return src(path.pug)
        .pipe(plumber())
        .pipe(pug({
                pretty: true //отключение минификации
            }
        ))
        .pipe(dest(path.project))
    // .pipe(browsersync.reload({stream: true}));
};

function stream() {
    watch(path.sass, parallel(css))
    watch(path.pug, parallel(buildHTML))

};

exports.browserReload = browserReload;
exports.css = css;
exports.buildHTML = buildHTML;
exports.stream = stream;
exports.defaults = parallel(stream, browserReload);
