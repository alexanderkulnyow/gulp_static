'use strict';
const
    {src, dest, parallel, series, watch} = require('gulp'),
    fs = require('fs'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    nano = require('gulp-clean-css'),
    include = require("gulp-include"),
    uglify = require('gulp-uglifyjs'),
    rename = require('gulp-rename'),
    pug = require('gulp-pug'),
    plumber = require('gulp-plumber'),
    prettyHtml = require('gulp-pretty-html'),
    debug = require('gulp-debug'),
    browserReload = require('browser-sync');

const
    path = {
        project: './',
        pug: 'src/pug/index.pug',
        pugreload: 'src/pug/**/*.pug',
        css: 'css/',
        sass: 'src/sass/*.scss',
        js: 'src/js/**/*.js',
        bundle: 'js/'
    };

let prettyOption = {
    indent_size: 2,
    indent_char: ' ',
    unformatted: ['code', 'em', 'strong', 'span', 'i', 'b', 'br', 'script'],
    content_unformatted: [],
};

function css() {
    return src(path.sass)
        .pipe(plumber(
            ({
                errorHandler: function (err) {
                    console.log(err.message);
                    this.emit('end');
                }
            })
        ))
        .pipe(debug({title: 'Compiles:'}))
        .pipe(sass({}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(sourcemaps.init())
        .pipe(nano())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.css))
}

function browserSync() {
    browserReload.init(
        {
            server: {
                baseDir: "./"
            },
            // proxy: {
            //     target: 'https://arena.loc/',
            // },
            files: [path.pug, path.sass, path.js],
            port: 3002,
            https: {
                // key: "../../../userdata/config/cert_files/server.key",
                // cert: "../../../userdata/config/cert_files/server.crt",
            },
            notify: false
        }
    );
}

function buildHTML() {
    return src(path.pug)
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.emit('end');
            }
        }))
        .pipe(debug({title: 'Compiles '}))
        .pipe(pug({
                pretty: prettyHtml(prettyOption) //отключение минификации
            }
        ))
        .pipe(dest(path.project))
    // .pipe(browsersync.reload({stream: true}));
}

function scripts() {
    src(path.js)
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.emit('end');
            }
        }))
        .pipe(debug({title: 'Compiles '}))
        .pipe(sourcemaps.init())
        .pipe(include())
        .on('error', console.log)
        .pipe(rename('index.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(path.bundle)) // Выгружаем в папку app/js
}

function stream() {
    watch(path.sass, parallel(css))
    watch(path.pugreload, parallel(buildHTML))
    watch(path.js, parallel(scripts))

}

exports.browserReload = browserSync;
exports.css = css;
exports.buildHTML = buildHTML;
exports.scripts = scripts;
exports.stream = stream;
exports.defaults = parallel(stream, browserSync);
