var matchNamedParamsInPath = require('./ContainNamedParamsRequest/MatchNamedParamsInPath');
var matchNamedParamsInParamsAndData = require('./ContainNamedParamsRequest/MatchNamedParamsInParamsAndData');

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
