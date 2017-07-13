const { CommandLineOptions } = require('./CommandLineOptions');
const { Logger } = require('./Logger');
const { WorkerQueue } = require('./WorkerQueue');
const nano = require('nano');
const { ReplicationManager } = require('./ReplicationManager');

const logger = new Logger();
const options = new CommandLineOptions(process.argv);

function printUsage() {
  logger.logString('Usage: ReplicationManager.js [adminUrl] [replicationUrl] [sourceDbRegex] [targetDb]');
  logger.logString('Example:');
  logger.logString(
    'node /vagrant/scripts/CouchDB/ReplicatorManager/ReplicationManager.js --adminUrl "http://admin:bar@127.0.0.1:5984/" --sourceBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/" --targetBaseUrl "http://labeling_api_read_only:pEid4oShu@127.0.0.1:5984/"  --sourceDbRegex "(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)" --targetDb "labeling_api_read_only" [--hotStandByUrl "http://admin:bar@127.0.0.1:5989/]',
  );
  process.exit(1);
}

if (!options.isComplete()) {
  printUsage();
}

const nanoAdmin = nano(options.adminUrl);
const ReplicationManagerStarter = new ReplicationManager(
  logger,
  nanoAdmin,
  new WorkerQueue(nanoAdmin, logger),
  options,
);
ReplicationManagerStarter.run();

