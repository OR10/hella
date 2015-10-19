import gulp from 'gulp';
import del from 'del';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import {Server as KarmaServer} from 'karma';
import fs from 'fs';

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
  }
};
paths.files = {
  'js': `${paths.dir.js}/**/*.js`,
  'support': `${paths.dir.support}/**/*.js`,
  'vendor': `${paths.dir.vendor}/**/*`,
  'css': `${paths.dir.styles}/**/*.css`,
  'tests': {
    'unit': `${paths.dir.tests.unit}/*.js`
  },
  'system': {
    'config': `${paths.dir.js}/system.config.js`
  },
  'gulp': {
    'config': `Gulpfile.babel.js`
  }
};

gulp.task('clean', next => {
  del([
    'Distribution/**/*'
  ], next);
});

gulp.task('serve', next => { //eslint-disable-line no-unused-vars
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
