import configuration from '../../../Application/Common/config.json';

class PouchDbWrapper {
}

PouchDbWrapper.DATABASE_NAME = `TASKID-TASKID-${configuration.storage.local.databaseName}`;


PouchDbWrapper.allDocs = () => {
  return browser.executeAsyncScript((databaseName, callback) => {
    const db = new PouchDB(databaseName);

    return db.allDocs({include_docs: true}).then((result) => {
      callback(result);
    });
  }, PouchDbWrapper.DATABASE_NAME);
};

PouchDbWrapper.bulkDocs = documents => {
  return browser.executeAsyncScript((databaseName, documents, callback) => {
    const db = new PouchDB(databaseName);

    return db.bulkDocs(documents).then((result) => {
      callback(result);
    });
  }, PouchDbWrapper.DATABASE_NAME, documents);
};


export default PouchDbWrapper;