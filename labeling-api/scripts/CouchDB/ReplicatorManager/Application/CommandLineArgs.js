const commandLineArgs = require('command-line-args');

class CommandLineArgs {
  static parse() {
    const optionDefinitions = [
      { name: 'adminUrl', type: String },
      { name: 'sourceBaseUrl', type: String },
      { name: 'targetBaseUrl', type: String },
      { name: 'hotStandByUrl', type: String },
      { name: 'sourceDbRegex', type: String },
      { name: 'targetDb', type: String },
    ];

    const options = commandLineArgs(optionDefinitions);


    if (options.adminUrl === undefined ||
      options.sourceBaseUrl === undefined ||
      options.targetBaseUrl === undefined ||
      options.sourceDbRegex === undefined ||
      options.targetDb === undefined) {
      /* eslint-disable no-console */
      console.log('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
      console.log('Example:');
      console.log(
        'node /vagrant/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl "http://admin:bar@127.0.0.1:5984/" --sourceBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/" --targetBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/"  --sourceDbRegex "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" --targetDb "labeling_api_read_only" [--hotStandByUrl "http://admin:bar@127.0.0.1:5989/]');
      /* eslint-enable no-console */

      process.exit(1);
    }

    return options;
  }
}

exports.CommandLineArgs = CommandLineArgs;
