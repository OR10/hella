import gulp from "gulp";
import del from "del";
import path from "path";
import gulpLoadPlugins from "gulp-load-plugins";
import {Server as KarmaServer} from "karma";
import fs from "fs";

import DevServer from './Support/DevServer';

const $$ = gulpLoadPlugins();

const paths = {
  js: 'Application/scripts/**/*.js',
  css: 'Application/styles/**/*.css',
  tests: {
    unit: 'Tests/unit/**/*.js'
  }
};

gulp.task("clean", next => {
  del([
    "Distribution/**/*"
  ], next);
});

gulp.task("serve", next => {
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/

  const devServer = new DevServer({
    baseUrl: "Application/",
    buildOptions: {
      sfx: true
    },
    entryPointExpression: 'scripts/main.js'
  });

  devServer.serve();

  gulp.watch("Application/**/*", event => {
    var relativePath = path.relative(__dirname + "/Application/", event.path);
    devServer.notifyChange(relativePath);
  });
});

gulp.task("eslint", next => {
  return gulp.src([paths.js, paths.tests.unit])
    .pipe($$.eslint())
    .pipe($$.eslint.format());
});

gulp.task("eslint-checkstyle", next => {
  return gulp.src([paths.js, paths.tests.unit])
    .pipe($$.eslint())
    .pipe($$.eslint.format('checkstyle', fs.createWriteStream("Logs/eslint.xml")));
});

gulp.task("test-unit", next => {
  const karmaServer = new KarmaServer({
    configFile: path.join(__dirname, '/karma.conf.js')
  });

  return karmaServer.start();
});
