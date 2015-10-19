import gulp from 'gulp';
import del from 'del';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import {Server as KarmaServer} from 'karma';
import fs from 'fs';
import {Builder} from 'jspm';
import sassJspm from 'sass-jspm-importer';
import run from 'run-sequence';

import DevServer from './Support/DevServer';

const $$ = gulpLoadPlugins();

const paths = {};
paths.dir = {
  'js': 'Application',
  'support': 'Support',
  'vendor': 'Application/Vendor',
  'sass': 'Styles',
  'css': 'Distribution/Styles',
  'tests': {
    'unit': 'Tests/Unit'
  },
  'distribution': 'Distribution',
  'public': 'Public'
};
paths.files = {
  'js': `${paths.dir.js}/**/*.js`,
  'support': `${paths.dir.support}/**/*.js`,
  'vendor': `${paths.dir.vendor}/**/*`,
  'sass': {
    'all': `${paths.dir.sass}/**/*.{scss,sass}`,
    'entrypoints': [`${paths.dir.sass}/**/*.{scss,sass}`, `!${paths.dir.sass}/**/_*.{scss,sass}`],
  },
  'css': `${paths.dir.css}/**/*.css`,
  'tests': {
    'unit': `${paths.dir.tests.unit}/*.js`
  },
  'system': {
    'config': `${paths.dir.js}/system.config.js`
  },
  'gulp': {
    'config': `Gulpfile.babel.js`
  },
  'public': `${paths.dir.public}/**/*`
};

gulp.task('clean', () => {
  return del([
   `${paths.dir.distribution}/**/*`
  ]);
});

gulp.task('serve', next => { //eslint-disable-line no-unused-vars
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/
  run(
    'clean',
    'build-public',
    'build-sass',
    (next) => {
      const devServer = new DevServer({
        'baseURL': './',
        'assetPath': `${__dirname}/Distribution`,
        'buildOptions': {
          'sfx': true
        },
        'entryPointExpression': 'Application/main.js'
      });

      devServer.serve();

      gulp.watch('paths.files.js', event => {
        const relativePath = path.relative(__dirname, event.path);
        devServer.notifyChange(relativePath);
      });

      gulp.watch(paths.files.public, event => {
        const relativePath = path.relative(__dirname, event.path);
        run(
          'build-public',
          () => devServer.notifyChange(relativePath)
        );
      });

      gulp.watch(paths.files.sass.all, event => {
        const relativePath = path.relative(__dirname, event.path);
        run(
          'build-sass',
          () => devServer.notifyChange(relativePath)
        );
      });
    }
  );
});

gulp.task('build-javascript', () => {
  const config = {
    'baseURL': './',
    'buildOptions': {
      'minify': false,
      'mangle': false,
      'sourceMaps': true
    },
    'entryPointExpression': 'Application/main.js'
  };

  const builder = new Builder(config.baseURL, paths.files.system.config);
  return builder.buildStatic(
    config.entryPointExpression,
    `${paths.dir.distribution}/lib/bundle.js`,
    config.buildOptions
  );
});

gulp.task('build-public', () => {
  return gulp.src(paths.files.public)
    .pipe(gulp.dest(paths.dir.distribution));
});

gulp.task('build', next => run(
  'build-public',
  ['build-javascript', 'build-sass'],
  next
));

gulp.task('optimize-javascript', () => {
  return gulp.src(`${paths.dir.distribution}/lib/bundle.js`)
  .pipe($$.uglifyjs({
    mangle: true,
    warning: true,
    preserveComment: 'license',
    outSourceMap: `bundle.min.js.map`,
    inSourceMap: `${paths.dir.distribution}/lib/bundle.js.map`
  }))
  .pipe($$.if("*.js", $$.rename({extname: ".min.js"})))
  .pipe(gulp.dest(`${paths.dir.distribution}/lib/`));
});

gulp.task('optimize', next => run(
  ['optimize-javascript', 'optimize-css'],
  next
));

gulp.task('eslint', () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit
  ])
  .pipe($$.eslint())
  .pipe($$.eslint.format());
});

gulp.task('eslint-checkstyle', () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit
  ])
  .pipe($$.eslint())
  .pipe($$.eslint.format('checkstyle', fs.createWriteStream('Logs/eslint.xml')));
});

gulp.task('test-unit', () => {
  const karmaServer = new KarmaServer({
    'configFile': path.join(__dirname, '/karma.conf.js')
  });

  return karmaServer.start();
});

gulp.task('test-unit-continuous', function() {
  const karmaServer = new KarmaServer({
    singleRun: false,
    autoWatch: true,
    configFile: path.join(__dirname, '/karma.conf.js')
  });

  karmaServer.start();
});

gulp.task('build-sass', () => {
  return gulp.src(paths.files.sass.entrypoints)
    .pipe($$.sourcemaps.init())
    .pipe($$.sass({
      precision: 8,
      errLogToConsole: true,
      functions: sassJspm.resolve_function('Application/vendor/'),
      importer: sassJspm.importer
    }))
    .pipe($$.autoprefixer())
    .pipe($$.sourcemaps.write('./', {sourceRoot: null}))
    .pipe(gulp.dest(`${paths.dir.css}`));
});

gulp.task('optimize-css', () => {
  return gulp.src(paths.files.css)
    .pipe($$.sourcemaps.init({loadMaps: true}))
    .pipe($$.minifyCss({
      sourceMapInlineSources: true
    }))
    .pipe($$.rename({extname: '.min.css'}))
    .pipe($$.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dir.css));
});

gulp.task('default', next => run(
  'clean',
  'build',
  'optimize',
  next
));
