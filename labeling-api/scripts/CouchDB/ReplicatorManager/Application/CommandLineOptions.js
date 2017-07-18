const commandLineArgs = require('command-line-args');

class CommandLineOptions {
  constructor(processArgv) {
    this.processArgv = processArgv;
    this.optionDefinitions = [
      { name: 'adminUrl', type: String },
      { name: 'sourceBaseUrl', type: String },
      { name: 'targetBaseUrl', type: String },
      { name: 'hotStandByUrl', type: String },
      { name: 'sourceDbRegex', type: String },
      { name: 'targetDb', type: String },
    ];

    this._init();
  }

  _init() {
    const options = commandLineArgs(this.optionDefinitions, { argv: this.processArgv });
    this.adminUrl = options.adminUrl;
    this.sourceBaseUrl = options.sourceBaseUrl;
    this.targetBaseUrl = options.targetBaseUrl;
    this.sourceDbRegex = options.sourceDbRegex;
    this.targetDb = options.targetDb;
    this.hotStandByUrl = options.hotStandByUrl;
  }

  isComplete() {
    return !(this.adminUrl === undefined ||
    this.sourceBaseUrl === undefined ||
    this.targetBaseUrl === undefined ||
    this.sourceDbRegex === undefined ||
    this.targetDb === undefined);
  }
}

exports.CommandLineOptions = CommandLineOptions;
