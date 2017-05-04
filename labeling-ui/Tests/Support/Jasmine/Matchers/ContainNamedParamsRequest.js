var matchNamedParamsInPath = require('./ContainNamedParamsRequest/MatchNamedParamsInPath');
var matchNamedParamsInParamsAndData = require('./ContainNamedParamsRequest/MatchNamedParamsInParamsAndData');
var features = require('../../../../Application/features.json');

if (features.pouchdb) {
  var configuration = require('../../../../Application/Common/config.json');

  module.exports = function toContainNamedParamsRequest() {
    return {
      compare: function (mockedRequests, namedParamsMock) {

        let result = {
          message: 'Läuft',
        };

        browser.executeScript(() => {
          const db = new PouchDB(`TASKID-TASKID-AnnoStation`);
          db.put({id: 'foobar'});
        });

        browser.sleep(4000);

        const pouchDocument = browser.executeAsyncScript((configuration, callback) => {
          const db = new PouchDB(`TASKID-TASKID-${configuration.storage.local.databaseName}`);

          return db.allDocs({include_docs: true}).then((result) => {
            callback(result);
          });
        }, configuration);

        console.log(pouchDocument);
        result.pass = pouchDocument.then((result) => {
          console.log(result);
          return true;
        });
        // result.pass = true;

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
