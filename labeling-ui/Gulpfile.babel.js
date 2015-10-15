import gulp from "gulp";
import del from "del";
import path from "path";
import gulpLoadPlugins from "gulp-load-plugins";

import DevServer from './Support/DevServer';

const $$ = gulpLoadPlugins();

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
    entryPointExpression: 'main.js'
  });

  devServer.serve();

  gulp.watch("Application/**/*", event => {
    var relativePath = path.relative(__dirname + "/Application/", event.path);
    devServer.notifyChange(relativePath);
  });
});
