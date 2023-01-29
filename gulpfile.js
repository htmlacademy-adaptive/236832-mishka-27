import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemap from 'gulp-sourcemaps';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import csso from 'gulp-csso';
import htmlmin from 'gulp-htmlmin';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgstore';
import svgstore from 'gulp-svgstore';
import imagemin from 'gulp-imagemin';
import {deleteAsync as del} from 'del';
import terser from 'gulp-terser';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(sourcemap.write('.'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css/'))
    .pipe(browser.stream());
}

// Html
const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(gulp.dest('build/'))
}

// Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js/'))
    .pipe(sync.stream())
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = done => {
  sync.reload();
  done();
  }

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'))
}

// Image-min

const images = () => {
  return gulp.src('source/img/*.{jpg,png, svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
    ]))
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
    .pipe(squoosh({
      webp: {}
    }))
		.pipe(gulp.dest('build/img'))
}

// SVG

const svg = () => {
  return gulp.src(['source/img/*.svg', 'source/img/icons/stats-icons/*.svg'])
    .pipe(gulp.dest('build/img/icons'))
}

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
  .pipe(svgo())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

//Build

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/img/*.ico',
    "source/img/**/*.{jpg,png,svg}",
  ], {
    base:'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

const clean = () => {
  return del("build");
};

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/js/script.js", gulp.series(scripts));
  gulp.watch("source/*.html", gulp.series(html, reload));
  }


const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
  styles,
  html,
  svg,
  sprite,
  createWebp
  )
)

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    svg,
    sprite,
    createWebp
),
gulp.series(
  server,
  watcher,
));
