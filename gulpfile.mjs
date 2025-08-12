// ====== Імпорти ======
import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import newer from 'gulp-newer';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import browserSyncLib from 'browser-sync';
import rename from 'gulp-rename';
import minimist from 'minimist';
import { deleteAsync } from 'del';
import through2 from 'through2';
import esbuild from 'gulp-esbuild';

const browserSync = browserSyncLib.create();
const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);

const options = minimist(process.argv.slice(2));
const isProd = options.production || false;

const paths = {
  styles: { src: 'src/*/styles/**/*.sass', dest: 'build' },
  scripts: { src: ['src/shared/**/*.js', 'src/*/script.js'], dest: 'build' },
  images: { src: 'src/*/images/**/*.{jpg,jpeg,png,svg,gif}', dest: 'build' },
  html: { src: 'src/*/*.html', dest: 'build' }
};

// ====== Хелпери ======
function noop() {
  return through2.obj();
}

function onError(err) {
  notify.onError({
    title: 'Gulp Error',
    message: '⛔ <%= error.message %>',
    sound: false
  })(err);
  this.emit('end');
}

// ====== Очищення ======
function clean() {
  return deleteAsync(['build']);
}

// ====== HTML ======
function html() {
  return src(paths.html.src, { base: 'src' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream());
}

// ====== SASS → CSS ======
function styles() {
  return src(paths.styles.src, { base: 'src' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(!isProd ? sourcemaps.init() : noop())
    .pipe(sass({ indentedSyntax: true }).on('error', sass.logError))
    .pipe(isProd ? cleanCSS({ level: 2 }) : noop())
    .pipe(!isProd ? sourcemaps.write('.') : noop())
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// ====== JS ======
function scripts() {
  return src(paths.scripts.src, { base: 'src' })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(esbuild({
      bundle: false, // збираємо кожен файл окремо
      sourcemap: !isProd,
      minify: isProd,
      target: 'es2015'
    }))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// ====== Зображення ======
function images() {
  return src(paths.images.src, { base: 'src' })
    .pipe(newer(paths.images.dest))
    .pipe(imagemin())
    .pipe(dest(paths.images.dest));
}

// ====== Сервер для Live-Reload ======
function serve() {
  browserSync.init({
    server: { baseDir: 'build/' },
    host: '127.0.0.1',
    port: 3000,
    ghostMode: { clicks: false },
    notify: false,
    online: true
  });

  watch(paths.styles.src, styles);
  watch(paths.scripts.src, scripts);
  watch(paths.images.src, images);
  watch(paths.html.src, html);
}

// ====== Експорти ======
export { clean, html, styles, scripts, images };
export const build = series(clean, parallel(styles, scripts, images, html));
export const dev = series(clean, parallel(styles, scripts, images, html), serve);
export default dev;
