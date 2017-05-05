var configuration = require('../../../../../Application/Common/config.json');
import matchDocuments from './MatchDocuments';

module.exports = function toContainNamedParamsRequest() {
  return {
    compare: function (mockedRequests, namedParamsMock) {

      let result = {
        message: 'Läuft',
      };

      const pouchQuery = browser.executeAsyncScript((configuration, callback) => {
        const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);

        return db.allDocs({include_docs: true}).then((result) => {
          callback(result);
        });
      }, configuration);

      result.pass = pouchQuery.then((allPouchDocuments) => {
        const namedParamsRequestData = namedParamsMock.request.data;
        const matchingDocuments = allPouchDocuments.rows.filter(row => matchDocuments(namedParamsRequestData, row.doc));
        const result = matchingDocuments.length > 0;
        return result;
      });

      return result;
    },
  };
};
