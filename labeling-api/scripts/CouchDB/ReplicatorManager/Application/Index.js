const { CommandLineArgs } = require('./CommandLineArgs');
const { Logger } = require('./Logger');
const { WorkerQueue } = require('./WorkerQueue');
const nano = require('nano');
const {ReplicationManager} = require('./ReplicationManager');
const options = CommandLineArgs.parse();

const nanoAdmin = nano(options.adminUrl);
const logger = new Logger();

const ReplicationManagerStarter = new ReplicationManager(
  logger,
  nanoAdmin,
  new WorkerQueue(nanoAdmin, logger),
  options,
);
ReplicationManagerStarter.run();
