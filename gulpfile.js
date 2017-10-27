const path = require('path');
const gulp = require('gulp');
const ts = require('gulp-typescript');
const browserify = require('browserify');
const tsify = require('tsify');
const through2 = require('through2');
const rename = require('gulp-rename');
const babelify = require('babelify');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const watch = require('gulp-watch');
const del = require('del');
const runSequence = require('run-sequence').use(gulp);
const runElectron = require("gulp-run-electron");
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const packager = require('electron-packager');
const npmPackage = require('./package.json');

const mainSrc = 'src/main';
const mainDist = 'dist/main';
const rendererSrc = 'src/renderer'
const rendererDist = 'dist/renderer'
const windowsSrc = rendererSrc + '/windows';
const windowsDist = rendererDist + '/windows';
const assetsSrc = rendererSrc + '/assets'
const assetsDist = rendererDist + '/assets'

const tsProject = ts.createProject('tsconfig.json');
const isDev = process.env.NODE_ENV !== 'production';

const uglifyOptions = {
  compress: {
    warnings: false,
    conditionals: true,
    unused: true,
    comparisons: true,
    sequences: true,
    dead_code: true,
    evaluate: true,
    if_return: true,
    join_vars: true,
    drop_console: true
  },
  output: {
    comments: false
  }
};

const packagerOptions = {
  name: npmPackage.name,
  appVersion: npmPackage.version,
  dir: __dirname,
  icon: path.join(__dirname, './resources/icon'),
  out: 'release',
  platform: 'win32',
  arch: 'x64',
  electronVersion: npmPackage.dependencies.electron.replace(/[^0-9\.]/g, ''),
  ignore: ['release', 'types', 'src']
};

function browserified() {
  return through2.obj((file, enc, next) => {
    browserify(file.path, { debug: isDev })
      .plugin(tsify)
      .transform(babelify, { extensions: ['.tsx', '.ts'] })
      .external('electron')
      .bundle((err, res) => {
        if (err) return next(err);
        file.contents = res;
        next(null, file);
      });
  });
}

gulp.task('scripts:main', () => {
  const streem = gulp.src(`${mainSrc}/**/*.ts`)
    .pipe(plumber())
    .pipe(tsProject());

  if (!isDev) streem.pipe(uglify(uglifyOptions));

  return streem.pipe(gulp.dest(mainDist));;
});

gulp.task('scripts:renderer', () => {
  const streem = gulp.src(`${windowsSrc}/**/script.ts`)
    .pipe(plumber())
    .pipe(browserified())
    .pipe(rename({ extname: '.js' }));

  if (!isDev) streem.pipe(uglify(uglifyOptions));

  return streem.pipe(gulp.dest(windowsDist));
});

gulp.task('styles', () => {
  const streem = gulp.src(`${windowsSrc}/**/style.scss`)
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(postcss([require('css-mqpacker'), require('postcss-merge-rules')]));

  if (!isDev) streem.pipe(cleanCSS());

  return streem.pipe(gulp.dest(windowsDist));
});

gulp.task('views', () => {
  const streem = gulp.src(`${windowsSrc}/**/view.html`);

  if (!isDev) streem.pipe(htmlmin({ collapseWhitespace: true }));

  return streem.pipe(gulp.dest(windowsDist));
});

gulp.task('assets', () => {
  return gulp.src(`${assetsSrc}/*`)
    .pipe(gulp.dest(assetsDist));
});

gulp.task('delete:dist', (cb) => {
  return del('dist/', cb);
});

gulp.task('watch', () => {
  watch(`${mainSrc}/**/*.ts`, () => {
    runSequence(
      'scripts:main',
      'electron:restart'
    );
  });
  watch(`${rendererSrc}/**/**/**/*.ts`, () => gulp.start('scripts:renderer'));
  watch(`${rendererSrc}/**/**/**/*.scss`, () => gulp.start('styles'));
  watch(`${windowsSrc}/**/*.html`, () => gulp.start('views'));
  watch(`${assetsSrc}/*`, () => gulp.start('assets'));
});

gulp.task('electron:start', () => {
  gulp.src("dist/main")
    .pipe(runElectron());
})

gulp.task('electron:restart', (cb) => {
  runElectron.rerun(cb);
})

gulp.task('release', (cb) => {
  return packager(packagerOptions);
})

gulp.task('build', () => {
  runSequence(
    'delete:dist',
    'scripts:main',
    'scripts:renderer',
    'styles',
    'views',
    'assets',
    'release'
  )
});

gulp.task('default', () => {
  runSequence(
    'delete:dist',
    'scripts:main',
    'scripts:renderer',
    'styles',
    'views',
    'assets',
    'watch',
    'electron:start'
  )
});