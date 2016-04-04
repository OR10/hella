import yargs from 'yargs';
import Logger from '../Logger';
import fs from 'mz/fs';
import path from 'path';
import inquirer from '../Inquirer';
import request from 'request-promise';
import {
  PowerlineStatus,
  StaticSegment,
  StartTimeSegment,
  CounterSegment,
  PerSecondSegment,
  palette
} from 'powerline-statusbar';

const Solarized = palette.Solarized;

class CouchDbMigrationCommand {
  constructor() {
    this.description = 'Migrate CouchDB data structures';
  }

  run() {
    let options;
    let argv;
    let migration;
    let database;
    let status;

    return Promise.resolve()
      .then(() => {
        options = yargs.reset()
          .default('host', 'localhost').nargs('host', 1)
          .describe('host', 'Host name/ip to reach the couchdb, which should be migrated')
          .default('port', '5984').nargs('port', 1)
          .describe('port', 'Port to reach the couchdb at.')
          .default('m', null).alias('m', 'migration').nargs('m', 1)
          .describe('Migration to execute.')
          .default('h', false).alias('h', 'help').describe('h', 'Show help.');
        argv = options.argv;

        if (!!argv.h) {
          options.showHelp();
          process.exit(1);
        }
      })
      .then(() => {
        if (argv.migration === null) {
          return this.askForMigration();
        } else {
          return argv.migration;
        }
      })
      .then(selectedMigration => migration = selectedMigration)
      .then(() => this.askForDatabase(argv.host, argv.port))
      .then(selectedDatabase => database = selectedDatabase)
      .then(() => this.askForConfirmation(argv.host, argv.port, migration, database))
      .then(confirmation => {
        if (confirmation !== true) {
          Logger.warn('Migration aborted due to user request.');
          throw new Error('Migration aborted.');
        }
      })
      .then(() => status = this.setupStatusBar(argv.host, argv.port, migration, database))
      .then(() => this.runMigration(argv.host, argv.port, migration, database, status));
  }

  askForMigration() {
    return Promise.resolve()
      .then(() => fs.readdir(`${__dirname}/../CouchDbMigrations`))
      .then(files => files.map(
        file => path.parse(`${__dirname}/../CouchDbMigrations/${file}`)
      ))
      .then(files => files.map(
        file => file.name
      ))
      .then(files => files.filter(
        file => file.indexOf('Abstract') !== 0
      ))
      .then((migrations) => inquirer.prompt([{
        type: 'list',
        name: 'migration',
        message: 'Which migration should be executed?',
        choices: migrations,
      }]))
      .then(answer => answer.migration);
  }

  askForDatabase(host, port) {
    return Promise.resolve()
      .then(() => Logger.info(`Retrieving databases from http://${host}:${port}`))
      .then(() => request({uri: `http://${host}:${port}/_all_dbs`, json: true}))
      .then(databases => inquirer.prompt([{
        type: 'list',
        name: 'database',
        message: 'Which database should be migrated?',
        choices: databases,
      }]))
      .then(answer => answer.database);
  }

  askForConfirmation(host, port, migration, database) {
    return Promise.resolve()
      .then(() => inquirer.prompt({
          type: 'confirm',
          name: 'confirmation',
          default: false,
          message: `You are about to ${chalk.red('MIGRATE')} the database ${chalk.blue(database)} on ${chalk.blue(`${host}:${port}`)} using ${chalk.blue(migration)}. Continue?`
        }))
        .then(answer => answer.confirmation);
  }

  setupStatusBar(host, port, migration, database) {
    const tasks = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'Tasks: '
    });
    const labeledThings = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'LabeledThings: '
    });
    const labeledThingsInFrame = new CounterSegment(0, {
      foreground: Solarized.base0, background: Solarized.base2, separator: 'thin',
      prefix: 'LabeledThingsInFrame: '
    });

    const powerline = new PowerlineStatus(
      new StaticSegment(migration, {foreground: Solarized.base3, background: Solarized.yellow}),
      new StartTimeSegment('', {foreground: Solarized.base3, background: Solarized.orange}),
      tasks, labeledThings, labeledThingsInFrame
    );

    return {powerline, tasks, labeledThings, labeledThingsInFrame};
  }
  
  runMigration(host, port, migration, database, status) {
    const migrationClass = require(`${__dirname}/../CouchDbMigrations/${migration}.js`);
    const migrationInstance = new migrationClass(host, port, database, status);
    return migrationInstance.run();
  }
}

export default new CouchDbMigrationCommand();
