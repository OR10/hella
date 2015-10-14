/*eslint-env node */
"use strict";

var gulp = require("gulp");
var $$ = require("gulp-load-plugins")();
var exec = require("child_process").exec;
var run = require("run-sequence");
var del = require("del");
var path = require("path");

var IncrementalBuilder = require("./Support/IncrementalBuilder");

function execLive(command, next) {
    var child = exec(command, {maxBuffer: Number.MAX_SAFE_INTEGER}, next);

    child.stdout.on("data", function (data) {
        process.stdout.write(data);
    });

    child.stderr.on("data", function (data) {
        process.stderr.write(data);
    });
}

gulp.task("clean", function(next) {
    del([
        "Distribution/**/*"
    ], next);
});

gulp.task("serve", function (next) {
    var builder = new IncrementalBuilder("Application/", "system.config.js");
    gulp.watch("Application/**/*", function(event) {
        var relativePath = path.relative(__dirname + "/Application/", event.path);
        builder.rebuild(relativePath);
    });

    builder.build("main.js", "Distribution/bundle.js");
});
