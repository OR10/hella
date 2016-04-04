import yargs from 'yargs';
import Logger from './Logger';
import fs from 'mz/fs';
import path from 'path';

let options;
let commands;
let argv;

Promise.resolve()
  .then(() => {
    options = yargs
      .usage('Usage: $0 <command> <options>')
      .demand(1)
      .describe('h', 'Show help').alias('h', 'help').boolean('h');
  })
  .then(() => fs.readdir(`${__dirname}/Commands`))
  .then(files => {
    commands = files.reduce((accum, filename) => {
      const file = path.parse(`${__dirname}/Commands/${filename}`);
      const name = file.name;
      accum[name] = {
        name,
        filename,
        file,
        module: require(`${file.dir}/${file.name}`),
      };
      return accum;
    }, {});
  })
  .then(() => {
    Object.keys(commands).forEach(
      name => yargs.command(name, commands[name].module.description)
    );
    argv = options.argv;

    if (!!argv.h) {
      options.showHelp();
    }

    if (argv._.length !== 1) {
      process.exit(0);
    }

    if (commands[argv._[0]] === undefined) {
      Logger.error(`Unknown command: ${argv._[0]}.`);
      process.exit(1);
    }
  })
  .then(() => commands[argv._[0]].module.run())
  .then(() => process.exit(0))
  .catch(error => {
    if (!!error.stack) {
      Logger.error(error.stack);
    } else {
      Logger.error(error);
    }
    process.exit(1);
  });

