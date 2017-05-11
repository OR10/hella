var configuration = require('../../../../../Application/Common/config.json');
import {matchDocuments, lastMatchChecked} from './MatchDocuments';

module.exports = function toContainNamedParamsRequest() {
  return {
    compare: function (mockedRequests, namedParamsMock) {

      let overallResult = {
        message: 'Expected document not found in Pouch DB',
      };

      const pouchQuery = browser.executeAsyncScript((configuration, callback) => {
        const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);

        return db.allDocs({include_docs: true}).then((result) => {
          callback(result);
        });
      }, configuration);

      overallResult.pass = pouchQuery.then((allPouchDocuments) => {
        const namedParamsRequestData = namedParamsMock.request.data;
        const matchingDocuments = allPouchDocuments.rows.filter(row => matchDocuments(namedParamsRequestData, row.doc));
        const result = matchingDocuments.length > 0;
        const lastMatchMade = lastMatchChecked();
        overallResult.message = `0 matching documents found. Last Check made: Expected key "${lastMatchMade.key} to be "${lastMatchMade.expected}". Got "${lastMatchMade.actual}"`;
        return result;
      });

      return overallResult;
    },
  };
};
