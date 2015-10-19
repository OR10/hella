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
  'styles': 'Public/Styles',
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
  'css': `${paths.dir.styles}/**/*.css`,
  'sourcemaps': {
    'css':`${paths.dir.styles}/**/*.css.map`
  },
  'sass': [`${paths.dir.styles}/**/*.{scss,sass}`, `!${paths.dir.styles}/**/_*.{scss,sass}`],
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
   `${paths.dir.distribution}/**/*`,
    paths.files.css,
    paths.files.sourcemaps.css
  ]);
});

gulp.task('serve', ['sass'], next => { //eslint-disable-line no-unused-vars
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/

  const devServer = new DevServer({
    'baseURL': './',
    'buildOptions': {
      'sfx': true
    },
    'entryPointExpression': 'Application/main.js'
  });

  devServer.serve();

  gulp.watch('Application/**/*', event => {
    const relativePath = path.relative(__dirname, event.path);
    devServer.notifyChange(relativePath);
  });
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
  ['build-javascript', 'build-public'],
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
  'optimize-javascript',
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

gulp.task('sass', ['clean'], () => {
  return gulp.src(paths.files.sass)
    .pipe($$.sourcemaps.init())
    .pipe($$.sass({
      precision: 8,
      errLogToConsole: true,
      functions: sassJspm.resolve_function('/Application/vendor/'),
      importer: sassJspm.importer
    }))
    .pipe($$.autoprefixer())
    .pipe($$.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dir.styles));
});

gulp.task('optimize-css', ['sass'], () => {
  return gulp.src(paths.files.css)
    .pipe($$.minifyCss())
    .pipe($$.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dir.styles));
));

gulp.task('default', next => run(
  'clean',
  'build',
  'optimize',
  next
));
