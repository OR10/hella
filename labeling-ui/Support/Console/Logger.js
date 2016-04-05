import chalk from 'chalk';
import inquirer from './Inquirer';
import util from 'util';

const ui = new inquirer.ui.BottomBar();
let lastStatus = '';
ui.updateBottomBar(lastStatus);

const Logger = {
  raw(type, ...args) {
    let symbol;

    switch (type) {
      case 'debug':
        symbol = '👀';
        break;
      case 'info':
        symbol = '💡';
        break;
      case 'warn':
        symbol = '⚡️';
        break;
      case 'error':
        symbol = '❌';
        break;
      default:
        symbol = type;
    }

    let msg;
    if (type === 'error') {
      msg = symbol + '  ' + chalk.red(args[0]);
    } else {
      msg = symbol + '  ' + args[0];
    }

    args.shift();
    args.unshift(msg);

    ui.log.write(
      util.format.apply(null, args) + '\n'
    );
  },

  updateStatus(status) {
    if (lastStatus === status) {
      return;
    }

    ui.updateBottomBar(status);
    lastStatus = status;
  }
};

Logger.json = function logJson(structure) {
  ui.log.write(JSON.stringify(structure, null, 2) + '\n');
};

Logger.storage = Logger.raw.bind(Logger, '📝');

// Map usual logger types
['log', 'info', 'warn', 'error'].forEach(type => {
  Logger[type] = function log(...args) {
    Logger.raw(type, ...args);
  };
});

export default Logger;
