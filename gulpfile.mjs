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
import del from 'del';
import through2 from 'through2';


// const browserSync = browserSyncLib.create();
// const { src, dest, watch, series, parallel } = gulp;
// const sass = gulpSass(dartSass);

// const options = minimist(process.argv.slice(2));
// const isProd = options.production || false;

// const paths = {
//   styles: { src: 'src/sass/**/*.sass', dest: 'assets/build/css/' },
//   scripts: { src: 'src/js/main.js', dest: 'assets/build/js/' },
//   images: { src: 'src/images/**/*.{jpg,jpeg,png,svg,gif}', dest: 'assets/build/images/' },
//   vendor: { src: 'src/vendor/**/*', dest: 'assets/build/vendor/' },
//   html: { src: ['src/html/**/*.html', '!src/html/partials/**'], dest: 'assets/build/' }
// };

function onError(err) {
  notify.onError({
    title: 'Gulp Error',
    message: '⛔ <%= error.message %>',
    sound: false
  })(err);
  this.emit('end');
}

function clean() {
  return del(['build']);
}

// function html() {
//   return src(paths.html.src)
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(fileInclude({
//       prefix: '@@',
//       basepath: '@file'
//     }))
//     .pipe(dest(paths.html.dest))
//     .pipe(browserSync.stream());
// }


// function styles() {
//   const originalWrite = process.stderr.write;
// process.stderr.write = (msg, encoding, fd) => {
//   if (msg.toString().includes('Deprecation Warning')) return true;
//   return originalWrite.call(process.stderr, msg, encoding, fd);
// };

//   return src(paths.styles.src)
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(!isProd ? sourcemaps.init() : noop())
//     .pipe(sass({ indentedSyntax: true }).on('error', sass.logError))
//     .pipe(postcss([autoprefixer()]))
//     .pipe(isProd ? cleanCSS({ level: 2 }) : noop())
//     .pipe(!isProd ? sourcemaps.write('.') : noop())
//     .pipe(dest(paths.styles.dest))
//     .pipe(browserSync.stream());
// }

// function scripts() {
//   return src(paths.scripts.src)
//     .pipe(plumber({ errorHandler: onError }))
//     .pipe(esbuild({
//       bundle: true,
//       outfile: 'bundle.js',
//       sourcemap: !isProd,
//       minify: isProd,
//       target: 'es2015'
//     }))
//     .pipe(dest(paths.scripts.dest))
//     .pipe(browserSync.stream());
// }

function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin())
    .pipe(dest(paths.images.dest));
}


// function vendor() {
//   return src(paths.vendor.src).pipe(dest(paths.vendor.dest));
// }

function serve() {
  browserSync.init({
    server: {
      baseDir: 'assets/build/',
    },
    ghostMode: { clicks: false },
    notify: false,
    online: true,
    // tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
  })
  watch(paths.styles.src, styles);
  watch('src/js/**/*.js', scripts);
  watch(paths.images.src, series(images, convertWebp, convertAvif));
  watch('src/html/**/*.html', html);
  watch('../**/*.htm').on('change', browserSync.reload);
}

function noop() {
    return through2.obj();
}


// export { clean, html, styles, scripts, images, convertWebp as webp, convertAvif as avif, vendor };
// export const build = series(clean, parallel(styles, scripts, images, convertWebp, convertAvif, vendor, html));
// export default series(clean, parallel(styles, scripts, images, convertWebp, convertAvif, vendor, html), serve);