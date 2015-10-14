var Builder = require("jspm").Builder;
var chalk = require("chalk");
var moment = require("moment");

function IncrementalBuilder(baseUrl, systemConfigPath) {
    this.invalidateFile = this.invalidateFile.bind(this);

    this.baseUrl = baseUrl;
    this.systemConfigPath = systemConfigPath;

    this.entrypointExpression = null;
    this.outputFile = null;
    this.buildOptions = null;

    this.buildCache = {};
}

IncrementalBuilder.defaultOptions = {
    minify: false,
    mangle: false,
    sourceMaps: true,
    sfx: false
};


IncrementalBuilder.prototype.build = function(entrypointExpression, outputFile, buildOptions) {
    this.entrypointExpression = entrypointExpression;
    this.outputFile = outputFile;
    this.buildOptions = Object.assign({}, IncrementalBuilder.defaultOptions, buildOptions);

    this.builder = new Builder();
    this.builder.setCache(this.buildCache);

    this.build_()
};

IncrementalBuilder.prototype.build_ = function() {
    var startTime = Date.now();
    this.log(chalk.yellow("Starting new build:"), this.entrypointExpression);

    Promise.resolve().then(function() {
        return this.builder.bundle(this.entrypointExpression, this.outputFile, this.buildOptions);
    }.bind(this)).then(function() {
        this.buildCache = this.builder.getCache();
        var endTime = Date.now();
        var duration = moment.duration(endTime - startTime).as("milliseconds");
        this.log(chalk.yellow("Build finished after"), chalk.blue(duration, "ms"));
    }.bind(this)).catch(function(error) {
        this.log(chalk.red("Build failed:"), error.message, "\n", error.stack);
    }.bind(this));
};



IncrementalBuilder.prototype.rebuild = function(changedFiles) {
    if (changedFiles === undefined) {
        changedFiles = [];
    } else if (typeof changedFiles === "string") {
        changedFiles = [changedFiles];
    }

    this.builder = new Builder();
    this.builder.setCache(this.buildCache);

    changedFiles.forEach(this.invalidateFile);
    this.build_();
};

IncrementalBuilder.prototype.log = function(/** ...args **/) {
    var args = Array.prototype.slice.apply(arguments);

    console.log.apply(console, args);
};

IncrementalBuilder.prototype.invalidateFile = function(filename) {
    this.log(chalk.blue("Invalidating:"), filename);
    console.log(this.builder.invalidate(filename));
};

module.exports = IncrementalBuilder;