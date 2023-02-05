import gulp from "gulp";
const {src, dest} = gulp;

import plumber from "gulp-plumber";
import removeComments from "gulp-strip-css-comments";
import cssbeautify from "gulp-cssbeautify";
import autoprefixer from "gulp-autoprefixer";
import cssmin from "gulp-cssmin";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import uglify from "gulp-uglify";
import panini from "panini";
import del from "del";

import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);

import browser from "browser-sync";
const browserSync = browser.create();

const srcPath = "src/";
const distPath = "dist/";

const path = {
    build: {
        html: distPath,
        css: distPath + "assets/css",
        js: distPath + "assets/js",
        img: distPath + "assets/img",
        fonts: distPath + "assets/fonts",
    },
    src: {
        html:  srcPath + "*.html",
        css:   srcPath + "assets/sass/*.sass",
        js:    srcPath + "assets/js/*.js",
        img:   srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcPath + "assets/fonts/*.{eot,woff,woff2,ttf,svg}",
    },
    watch: {
        html:  srcPath + "**/*.html",
        css:   srcPath + "assets/sass/**/*.sass",
        js:    srcPath + "assets/js/**/*.js",
        img:   srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },
    clean: "./" +  distPath
};

function html() {
    return src(path.src.html, {base: srcPath})
    .pipe(plumber())
    .pipe(dest(path.build.html))
}

function css() {
    return src(path.src.css, {base: srcPath + "assets/sass/"})
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cssmin())
    .pipe(removeComments())
    .pipe(rename({suffix: ".min"}))
    .pipe(dest(path.build.css))
}

function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"})
    .pipe(plumber())   
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({suffix: ".min"}))
    .pipe(dest(path.build.js))
}

function img() {
    return src(path.src.img, {base: srcPath + "assets/img/"})
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.mozjpeg({quality: 75, progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {
                    name: 'removeViewBox',
                    active: true
                },
                {
                    name: 'cleanupIDs',
                    active: false
                }
            ]
        })
    ]))
    .pipe(dest(path.build.img))
}

function fonts() {
    return src(path.src.fonts, {base: srcPath + "assets/fonts/"})
    .pipe(plumber())   
    .pipe(dest(path.build.fonts))
}

function clear() {
    return del(path.clean)
}

const build = gulp.series(clear, gulp.parallel(html, css, js, img, fonts))



export {html, css, js, img, fonts, clear, build}