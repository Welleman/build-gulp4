import gulp from "gulp";
const { src, dest } = gulp;

import plumber from "gulp-plumber";
import removeComments from "gulp-strip-css-comments";
import cssbeautify from "gulp-cssbeautify";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import rename from "gulp-rename";
import imagemin from "gulp-imagemin";
import uglify from "gulp-uglify";
import notify from "gulp-notify";
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
        html: srcPath + "*.html",
        css: srcPath + "assets/sass/*.sass",
        js: srcPath + "assets/js/*.js",
        img: srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcPath + "assets/fonts/*.{eot,woff,woff2,ttf,svg}",
    },
    watch: {
        html: srcPath + "**/*.html",
        css: srcPath + "assets/sass/**/*.sass",
        js: srcPath + "assets/js/**/*.js",
        img: srcPath + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
    },
    clean: "./" + distPath
};

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
}


function html() {
    panini.refresh()
    return src(path.src.html, { base: srcPath })
        .pipe(plumber())
        .pipe(panini({
            root: srcPath,
            layouts: srcPath + "tpl/layouts/",
            partials: srcPath + "tpl/partials/",
        }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }))
}

function css() {
    return src(path.src.css, { base: srcPath + "assets/sass/" })
        .pipe(plumber({
            errorHandler: (err) => {
                notify.onError({ 
                    title: "SASS Error", 
                    message: "<%= error.message %>" 
                })(err)
                this.emit("end")
            }
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(csso())
        .pipe(removeComments())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }))
}

function js() {
    return src(path.src.js, { base: srcPath + "assets/js/" })
        .pipe(plumber())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }))
}

function img() {
    return src(path.src.img, { base: srcPath + "assets/img/" })
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
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
        .pipe(browserSync.reload({ stream: true }))
}

function fonts() {
    return src(path.src.fonts, { base: srcPath + "assets/fonts/" })
        .pipe(plumber())
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }))
}

function clear() {
    return del(path.clean)
}

function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], img)
    gulp.watch([path.watch.fonts], fonts)
}

const build = gulp.series(clear, gulp.parallel(html, css, js, img, fonts))
const watch = gulp.parallel(build, watchFiles, serve)


export { html, css, js, img, fonts, clear, build, watch };
export default watch;