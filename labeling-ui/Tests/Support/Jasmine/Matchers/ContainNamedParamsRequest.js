var matchNamedParamsInPath = require('./ContainNamedParamsRequest/MatchNamedParamsInPath');
var matchNamedParamsInParamsAndData = require('./ContainNamedParamsRequest/MatchNamedParamsInParamsAndData');
var features = require('../../../../Application/features.json');

if (features.pouchdb) {
  var PouchDbContextService = require('../../../../Application/Common/Services/PouchDbContextService');
  var PouchDB = require('../../../../Application/Vendor/github/pouchdb/pouchdb@6.0.7/dist/pouchdb');
  var configuration = require('../../../../Application/Common/config.json');
  const contextService = new PouchDbContextService(configuration, PouchDB);

  // console.log(contextService.provideContextForTaskId('TASKID-TASKID'));

  module.exports = function toContainNamedParamsRequest() {
    return {
      compare: function (mockedRequests, namedParamsMock) {

        let result = {
          message: 'Läuft',
        };

        const pouchDocument = browser.executeScript((configuration) => {
          // const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);
          const db = new PouchDB(`TASKID-TASKID-AnnoStation`);
          return db.allDocs({include_docs: true});
        }, configuration);

        result.pass = pouchDocument.then((result) => {
          console.log(result);
          return true;
        });

        return result;
      },
    };
  };
} else {
  module.exports = function toContainNamedParamsRequest() {
    function containsNamedParamsRequest(mockedRequests, namedParamsRequest) {
      var containsRequest = false;

      mockedRequests.forEach(function(mockedRequest) {
        containsRequest = containsRequest ||
          (
            matchNamedParamsInPath(mockedRequest.path, namedParamsRequest.path) &&
            matchNamedParamsInParamsAndData(mockedRequest, namedParamsRequest)
          );
      });

      return containsRequest;
    }

    return {
      compare: function compare(mockedRequests, namedParamsMock) {
        var namedParamsRequest = namedParamsMock.request;
        return {
          pass: containsNamedParamsRequest(mockedRequests, namedParamsRequest),
          message: `NamedParamsRequest is no part of mocked requests:\n ${JSON.stringify(namedParamsRequest, undefined, 2)}\nnot found in\n${JSON.stringify(mockedRequests, undefined, 2)}`,
        };
      },
    };
  };
}
