import {Builder} from 'jspm';
import chalk from 'chalk';

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
    const startTime = Date.now();

    this.setupBuilder();

    this.log(chalk.yellow('Starting new build:'), this.entryPointExpression);

    return Promise.resolve().then(() => {
      if (this.buildOptions.sfx) {
        return this.builder.buildStatic(this.entryPointExpression, this.buildOptions);
      }

      return this.builder.bundle(this.entryPointExpression, this.buildOptions);
    }).then((output) => {
      this.buildCache = this.builder.getCache();

      const endTime = Date.now();
      const duration = endTime - startTime;
      this.log(chalk.yellow('Build finished after'), chalk.blue(duration, 'ms')); // eslint-disable-line no-console

      return output;
    }).catch(error => Promise.reject(error));
  }

  rebuild(changes) {
    let changedFiles;

    if (changes === undefined) {
      changedFiles = [];
    } else if (typeof changes === 'string') {
      changedFiles = [changes];
    }

    this.setupBuilder();

    changedFiles.forEach(this.invalidateFile);

    this.buildingPromise = this.build();

    return this.buildingPromise;
  }

  log(...args) {
    console.log.apply(console, args); // eslint-disable-line no-console
  }


  invalidateFile(filename) {
    this.log(chalk.blue('Invalidating:'), filename);
    this.builder.invalidate(filename);
  }
}

IncrementalBuilder.defaultOptions = {
  minify: false,
  mangle: false,
  sourceMaps: true,
  sfx: false,
};
