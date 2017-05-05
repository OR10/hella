let protractorPromise;
var features = require('../../../Application/features.json');
var configuration = require('../../../Application/Common/config.json');

beforeEach(() => {
  protractorPromise = protractor.promise.defer();
});

afterEach(done => {
  protractorPromise.fulfill('ok');
  expect(protractorPromise).toBe('ok');

  if (features.pouchdb) {
    const pouchDocument = browser.executeAsyncScript((configuration, callback) => {
      const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);

      return db.destroy().then((result) => {
        callback(result);
      });
    }, configuration);

    pouchDocument.then(() => {
      done();
    });
  }
});