import configuration from '../../../Application/Common/config.json';

class PouchDbWrapper {
}

PouchDbWrapper.DATABASE_NAME = `TASKID-TASKID-${configuration.storage.local.databaseName}`;

PouchDbWrapper.allDocs = () => {
  return browser.executeAsyncScript((databaseName, callback) => {
    if (window.__e2e_test_pouchdb_instance === undefined) {
      window.__e2e_test_pouchdb_instance = new PouchDB(databaseName);
    }
    const db = window.__e2e_test_pouchdb_instance;

    db.allDocs({include_docs: true}).then(result => {
      callback(result);
    });
  }, PouchDbWrapper.DATABASE_NAME);
};

PouchDbWrapper.bulkDocs = documents => {
  return browser.executeAsyncScript((databaseName, documents, callback) => {
    if (window.__e2e_test_pouchdb_instance === undefined) {
      window.__e2e_test_pouchdb_instance = new PouchDB(databaseName);
    }
    const db = window.__e2e_test_pouchdb_instance;

    db.bulkDocs(documents).then(result => {
      callback(result);
    });
  }, PouchDbWrapper.DATABASE_NAME, documents);
};

PouchDbWrapper.destroy = () => {
  return browser.executeAsyncScript((databaseName, callback) => {
    if (window.__e2e_test_pouchdb_instance === undefined) {
      window.__e2e_test_pouchdb_instance = new PouchDB(databaseName);
    }
    const db = window.__e2e_test_pouchdb_instance;

    db.destroy().then(result => {
      window.__e2e_test_pouchdb_instance = undefined;
      callback(result);
    });
  }, PouchDbWrapper.DATABASE_NAME);
};


export default PouchDbWrapper;
