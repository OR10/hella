var isEqual = require('lodash.isequal');

module.exports = function toContainRequest() {
  function fixDecimals(input) {
    return JSON.parse(
      JSON.stringify(input, function(key, value) {
        if (value !== null && value !== undefined && typeof value.toPrecision === 'function' && Number(value.toFixed(0)) !== value) {
          return Number(value.toPrecision(14));
        }

        return value;
      })
    );
  }

  function containsRequest(mockedRequests, request) {
    var contains = false;
    mockedRequests.forEach(function(mockedRequest) {
      contains = contains || isEqual(fixDecimals(mockedRequest), fixDecimals(request));
    });
    return contains;
  }

  return {
    compare: function compare(mockedRequests, mock) {
      const request = mock.request;
      return {
        pass: containsRequest(mockedRequests, request),
        message: `Request is no part of mocked requests:\n ${JSON.stringify(fixDecimals(request), undefined, 2)}\nnot found in\n${JSON.stringify(fixDecimals(mockedRequests), undefined, 2)}`,
      };
    },
  };
};
