import PouchDb from 'pouchdb';

class AbstractMigration {
  constructor(host, port, migration, database, logger) {
    this._host = host;
    this._port = port;
    this._migration = migration;
    this._database = database;
    this._logger = logger;

    this._pouchdb = new PouchDb(`http://${host}:${port}/${database}`);
  }
}

export default AbstractMigration;
