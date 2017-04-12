var matchNamedParamsInPath = require('./ContainNamedParamsRequest/MatchNamedParamsInPath');
var matchNamedParamsInParamsAndData = require('./ContainNamedParamsRequest/MatchNamedParamsInParamsAndData');

module.exports = function toContainNamedParamsRequestOnce() {
  function containsNamedParamsRequestOnce(mockedRequests, namedParamsRequest) {
    var count = 0;

    mockedRequests.forEach(function (mockedRequest) {
      if (matchNamedParamsInPath(mockedRequest.path, namedParamsRequest.path) &&
        matchNamedParamsInParamsAndData(mockedRequest, namedParamsRequest)) {
        count++;
      }
    });

    return count === 1;
  }

  return {
    compare: function compare(mockedRequests, namedParamsMock) {
      var namedParamsRequest = namedParamsMock.request;
      return {
        pass: containsNamedParamsRequestOnce(mockedRequests, namedParamsRequest),
        message: `NamedParamsRequest is no part of mocked requests or was called more than once!`,
      };
    },
  };
};
