import gulp from 'gulp';
import del from 'del';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import {Server as KarmaServer} from 'karma';
import fs from 'fs';
import jspm, {Builder} from 'jspm';
import sassJspm from 'sass-jspm-importer';
import run from 'run-sequence';
import {webdriver_update as webdriverUpdate, protractor} from 'gulp-protractor'; // eslint-disable-line camelcase

import DevServer from './Support/DevServer';
import ProtractorServer from './Tests/Support/ProtractorServer';

const $$ = gulpLoadPlugins();

const paths = {};
paths.dir = {
  'application': 'Application',
  'support': 'Support',
  'vendor': 'Application/Vendor',
  'sass': 'Styles',
  'css': 'Distribution/Styles',
  'fonts': 'Distribution/Fonts',
  'tests': {
    'unit': 'Tests/Unit',
    'e2e': 'Test/E2E',
  },
  'distribution': 'Distribution',
  'public': 'Public',
};
paths.files = {
  'js': `${paths.dir.application}/**/*.js`,
  'support': `${paths.dir.support}/**/*.js`,
  'vendor': `${paths.dir.vendor}/**/*`,
  'sass': {
    'all': `${paths.dir.sass}/**/*.{scss,sass}`,
    'entrypoints': [`${paths.dir.sass}/**/*.{scss,sass}`, `!${paths.dir.sass}/**/_*.{scss,sass}`],
  },
  'css': `${paths.dir.css}/**/*.css`,
  'tests': {
    'unit': `${paths.dir.tests.unit}/**/*.js`,
    'e2e': `${paths.dir.tests.e2e}/**/*.js`,
  },
  'system': {
    'config': `${paths.dir.application}/system.config.js`,
  },
  'gulp': {
    'config': `Gulpfile.babel.js`,
  },
  'public': `${paths.dir.public}/**/*`,
};

gulp.task('clean', () => {
  return del([
    `${paths.dir.distribution}/**/*`,
  ]);
});

gulp.task('serve', (next) => { // eslint-disable-line no-unused-vars
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/
  run(
    'clean',
    'build-public',
    ['build-sass', 'build-fonts'],
    () => {
      const devServer = new DevServer({
        'baseURL': './',
        'assetPath': `${__dirname}/Distribution`,
        'buildOptions': {
          'sfx': true,
        },
        'entryPointExpression': 'Application/main.js',
      });

      devServer.serve();

      gulp.watch(`${paths.dir.application}/**/*`, event => {
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
      'sourceMaps': true,
    },
    'entryPointExpression': 'Application/main.js',
  };

  const builder = new Builder(config.baseURL, paths.files.system.config);
  return builder.buildStatic(
    config.entryPointExpression,
    `${paths.dir.distribution}/Library/bundle.js`,
    config.buildOptions
  );
});

gulp.task('build-public', () => {
  return gulp.src(paths.files.public)
    .pipe(gulp.dest(paths.dir.distribution));
});

gulp.task('build', next => run(
  'build-public',
  ['build-javascript', 'build-sass', 'build-fonts'],
  next
));

gulp.task('optimize-javascript', () => {
  return gulp.src(`${paths.dir.distribution}/Library/bundle.js`)
    .pipe($$.uglifyjs({
      mangle: true,
      warning: true,
      preserveComment: 'license',
      outSourceMap: `bundle.min.js.map`,
      inSourceMap: `${paths.dir.distribution}/Library/bundle.js.map`,
    }))
    .pipe($$.if('*.js', $$.rename({extname: '.min.js'})))
    .pipe(gulp.dest(`${paths.dir.distribution}/Library/`));
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
    paths.files.tests.unit,
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
    paths.files.tests.unit,
  ])
  .pipe($$.eslint())
  .pipe($$.eslint.format('checkstyle', fs.createWriteStream('Logs/eslint.xml')));
});

gulp.task('test-unit', () => {
  const karmaServer = new KarmaServer({
    'configFile': path.join(__dirname, '/karma.conf.js'),
  });

  return karmaServer.start();
});

gulp.task('test-unit-continuous', () => {
  const karmaServer = new KarmaServer({
    singleRun: false,
    autoWatch: true,
    configFile: path.join(__dirname, '/karma.conf.js'),
  });

  karmaServer.start();
});

gulp.task('webdriver-update', webdriverUpdate);

gulp.task('test-e2e', ['webdriver-update'], (next) => { // eslint-disable-line no-unused-vars
  const protractorConfig = {
    configFile: 'protractor.conf.js',
    args: [],
  };

  if (typeof process.env.PROTRACTOR_SELENIUM_GRID !== 'undefined') {
    protractorConfig.args.push('--baseUrl', 'http://' + ip.address() + ':52343');
    protractorConfig.args.push('--seleniumAddress', 'http://' + process.env.PROTRACTOR_SELENIUM_GRID + ':4444/wd/hub');
  } else {
    protractorConfig.args.push('--baseUrl', 'http://localhost:52343');
  }

  run(
    'clean',
    'build',
    'optimize',
    () => {
      const protractorServer = new ProtractorServer({
        assetPath: 'Distribution',
        port: 52343,
      });

      protractorServer.serve();

      gulp.src(paths.files.tests.e2e)
        .pipe(protractor(protractorConfig))
        .on('error', (error) => {
          protractorServer.close();
          throw error;
        })
        .on('end', () => protractorServer.close());
    }
  );
});

gulp.task('build-sass', () => {
  return gulp.src(paths.files.sass.entrypoints)
    .pipe($$.sourcemaps.init())
    .pipe($$.sass({
      precision: 8,
      errLogToConsole: true,
      functions: sassJspm.resolve_function('Application/vendor/'),
      importer: sassJspm.importer,
    }))
    .pipe($$.autoprefixer())
    .pipe($$.sourcemaps.write('./', {sourceRoot: null}))
    .pipe(gulp.dest(`${paths.dir.css}`));
});

gulp.task('build-fonts', (next) => {
  jspm.normalize('font-awesome').then((normalizedFile) => {
    const normalizedPath = normalizedFile
      .replace(/file:\/\//, '')
      .replace(/\.js$/, '');

    gulp.src(`${normalizedPath}/fonts/**/*`)
      .pipe(gulp.dest(`${paths.dir.fonts}`))
      .on('end', next);
  });
});

gulp.task('optimize-css', () => {
  return gulp.src(paths.files.css)
    .pipe($$.sourcemaps.init({loadMaps: true}))
    .pipe($$.minifyCss({
      sourceMapInlineSources: true,
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
