import PouchDb from 'pouchdb';

class AbstractMigration {
  constructor(host, port, database, status) {
    this._host = host;
    this._port = port;
    this._database = database;
    this._status = status;

    this._pouchdb = new PouchDb(`http://${host}:${port}/${database}`);
  }
}

export default AbstractMigration;