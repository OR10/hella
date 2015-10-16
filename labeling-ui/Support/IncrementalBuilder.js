import {Builder} from "jspm";
import chalk from "chalk";

export default class IncrementalBuilder {
  constructor(baseURL, systemConfigPath, entryPointExpression, buildOptions) {
    this.invalidateFile = this.invalidateFile.bind(this);

    this.baseURL = baseURL;
    this.systemConfigPath = systemConfigPath;
    this.entryPointExpression = entryPointExpression;
    this.buildOptions = Object.assign({}, IncrementalBuilder.defaultOptions, buildOptions);

    this.bundle = null;
    this.buildingPromise = null;
    this.buildCache = {};
  }

  getBundle() {
    if (this.buildingPromise) {
      return this.buildingPromise;
    }

    this.buildingPromise = this.build();

    return this.buildingPromise;
  }

  setupBuilder() {
    this.builder = new Builder(this.baseURL, this.systemConfigPath);
    this.builder.setCache(this.buildCache);
  }

  build() {
    var startTime = Date.now();

    this.setupBuilder();

    this.log(chalk.yellow("Starting new build:"), this.entryPointExpression);

    return Promise.resolve().then(() => {
      if (this.buildOptions.sfx) {
        return this.builder.buildStatic(this.entryPointExpression, this.buildOptions);
      }

      return this.builder.bundle(this.entryPointExpression, this.buildOptions);
    }).then((output) => {
      this.buildCache = this.builder.getCache();

      var endTime = Date.now();
      var duration = endTime - startTime;
      this.log(chalk.yellow("Build finished after"), chalk.blue(duration, "ms"));

      return output;
    }).catch(error => Promise.reject(error));
  }

  rebuild(changedFiles) {
    if (changedFiles === undefined) {
      changedFiles = [];
    } else if (typeof changedFiles === "string") {
      changedFiles = [changedFiles];
    }

    this.setupBuilder();

    changedFiles.forEach(this.invalidateFile);

    this.buildingPromise = this.build();

    return this.buildingPromise;
  }

  log(...args) {
    console.log.apply(console, args);
  }


  invalidateFile(filename) {
    this.log(chalk.blue("Invalidating:"), filename);
    this.builder.invalidate(filename);
  }
}

IncrementalBuilder.defaultOptions = {
  minify: false,
  mangle: false,
  sourceMaps: true,
  sfx: false
};
