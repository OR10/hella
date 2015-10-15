/*eslint-env node */
"use strict";

var gulp = require("gulp");
var $$ = require("gulp-load-plugins")();
var del = require("del");
var path = require("path");

import DevServer from './Support/DevServer';

gulp.task("clean", function(next) {
  del([
    "Distribution/**/*"
  ], next);
});

gulp.task("serve", function() {
  const devServer = new DevServer({
    baseUrl: "Application/",
    buildOptions: {
      sfx: true
    },
    entryPointExpression: 'main.js'
  });

  devServer.serve();

  gulp.watch("Application/**/*", (event) => {
    var relativePath = path.relative(__dirname + "/Application/", event.path);
    devServer.notifyChange(relativePath);
  });
});
