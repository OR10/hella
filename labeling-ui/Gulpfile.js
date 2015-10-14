/*eslint-env node */
"use strict";

var gulp = require("gulp");
var $$ = require("gulp-load-plugins")();
var exec = require("child_process").exec;
var run = require("run-sequence");
var del = require("del");

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
    execLive("node server.js", next);
});
