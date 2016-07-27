import yargs from 'yargs';
import fs from 'mz/fs';
import {Builder} from 'jspm';

class SystemJsLoadOrderCommand {
  constructor() {
    this.description = 'Dump SystemJs load order dependencies';
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
          .default('exclude', '').nargs('exclude', 1)
          .describe('exclude', 'regex for modules to exclude')
          .default('include', '.*').nargs('include', 1)
          .describe('include', 'regex for modules to include')
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
      .then(() => this.runDependencyTreeGeneration(argv.config, argv.entrypoint, argv.include, argv.exclude));
  }

  runDependencyTreeGeneration(config, entrypoint, include, exclude) {
    return Promise.resolve()
      .then(() => console.log('Running dependency trace...')) // eslint-disable-line no-console
      .then(() => this.getTrace(config, entrypoint))
      .then(trace => {
        const includeRegExp = new RegExp(include);
        const excludeRegExp = new RegExp(exclude);
        const firstLevel = Object.keys(trace)
          .filter(module => trace[module].deps.length === 0)
          .filter(module => module.match(includeRegExp) !== null)
          .filter(module => module.match(excludeRegExp) === null);
        firstLevel.forEach(module => this.walkDependencies(trace, module, includeRegExp, excludeRegExp));
      });
  }

  walkDependencies(trace, startModule, includeRegExp, excludeRegExp, level = 0) {
    console.log(this.getIndentationForLevel(level) + startModule); // eslint-disable-line no-console
    const dependents = this.getDependentsForModule(trace, startModule)
      .filter(module => module.match(includeRegExp) !== null)
      .filter(module => module.match(excludeRegExp) === null);
    dependents.forEach(dependent => this.walkDependencies(trace, dependent, includeRegExp, excludeRegExp, level + 1));
  }

  getDependentsForModule(trace, searchModule) {
    return Object.keys(trace)
      .filter(moduleName => {
        const module = trace[moduleName];
        return Object.keys(module.depMap).reduce(
          (found, mappedName) => found || module.depMap[mappedName] === searchModule,
          false
        );
      });
  }

  getIndentationForLevel(level) {
    let indent = '';
    for (let index = 0; index < level; index++) {
      indent = indent + ' ';
    }

    return indent;
  }

  getTrace(config, entrypoint) {
    const builder = new Builder('./', config);
    return builder.trace(entrypoint);
  }
}

export default new SystemJsLoadOrderCommand;
