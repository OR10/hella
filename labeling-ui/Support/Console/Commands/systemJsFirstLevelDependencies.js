import yargs from 'yargs';
import fs from 'mz/fs';
import {Builder} from 'jspm';

class SystemJsFirstLevelDependenciesCommand {
  constructor() {
    this.description = 'Dump SystemJs first level dependencies';
  }

  run() {
    let options;
    let argv;

    return Promise.resolve()
      .then(() => {
        options = yargs.reset()
          .default('config', 'Application/system.config.js').nargs('config', 1)
          .describe('config', 'systemjs config to use')
          .default('entrypoint', 'Application/main').nargs('entrypoint', 1)
          .describe('entrypoint', 'application entrypoint')
          .default('h', false).alias('h', 'help').describe('h', 'Show help.');
        argv = options.argv;

        if (!!argv.h) {
          options.showHelp();
          process.exit(1);
        }
      })
      .then(() => {
        if (!fs.exists(argv.config)) {
          return Promise.reject(`The config file ${argv.config} could not be found.`);
        }
      })
      .then(() => this.runDependencyTreeGeneration(argv.config, argv.entrypoint));
  }

  runDependencyTreeGeneration(config, entrypoint) {
    return Promise.resolve()
      .then(() => this.getTrace(config, entrypoint))
      .then(trace => {
        const firstLevel = Object.keys(trace).filter(module => trace[module].deps.length === 0);
        firstLevel.forEach(module => console.log(module));
      });
  }

  getTrace(config, entrypoint) {
    const builder = new Builder('./', config);
    return builder.trace(entrypoint);
  }
}

export default new SystemJsFirstLevelDependenciesCommand();
