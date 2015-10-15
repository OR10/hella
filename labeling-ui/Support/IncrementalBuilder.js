var Builder = require("jspm").Builder;
var chalk = require("chalk");

function IncrementalBuilder(baseUrl, systemConfigPath, entryPointExpression, buildOptions) {
  this.invalidateFile = this.invalidateFile.bind(this);

  this.baseUrl = baseUrl;
  this.systemConfigPath = systemConfigPath;
  this.entryPointExpression = entryPointExpression;
  this.buildOptions = Object.assign({}, IncrementalBuilder.defaultOptions, buildOptions);

  this.bundle = null;
  this.buildingPromise = null;
  this.buildCache = {};
}

IncrementalBuilder.defaultOptions = {
  minify: false,
  mangle: false,
  sourceMaps: true,
  sfx: false
};

IncrementalBuilder.prototype.getBundle = function() {
  if (this.buildingPromise) {
    return this.buildingPromise;
  }

  this.buildingPromise = this.build();

  return this.buildingPromise;
};

IncrementalBuilder.prototype.setupBuilder = function() {
  this.builder = new Builder(this.baseUrl, this.systemConfigPath);
  this.builder.setCache(this.buildCache);
};

IncrementalBuilder.prototype.build = function() {
  var startTime = Date.now();

  this.setupBuilder();

  this.log(chalk.yellow("Starting new build:"), this.entryPointExpression);

  return Promise.resolve().then(function() {
    if (this.buildOptions.sfx) {
      return this.builder.buildStatic(this.entryPointExpression, this.buildOptions);
    }

    return this.builder.bundle(this.entryPointExpression, this.buildOptions);
  }.bind(this)).then(function(output) {
    this.buildCache = this.builder.getCache();

    var endTime = Date.now();
    var duration = endTime - startTime;
    this.log(chalk.yellow("Build finished after"), chalk.blue(duration, "ms"));

    return output;
  }.bind(this)).catch(function(error) {
    return Promise.reject(error);
  }.bind(this));
};

IncrementalBuilder.prototype.rebuild = function(changedFiles) {
  if (changedFiles === undefined) {
    changedFiles = [];
  } else if (typeof changedFiles === "string") {
    changedFiles = [changedFiles];
  }

  this.setupBuilder();

  changedFiles.forEach(this.invalidateFile);

  this.buildingPromise = this.build();

  return this.buildingPromise;
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