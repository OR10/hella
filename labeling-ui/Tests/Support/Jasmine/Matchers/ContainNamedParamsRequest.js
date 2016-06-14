module.exports = function toContainNamedParamsRequest() {
  // JSON.stringify, which has a stable sorting of keys regardless of the objects definition order
  function deterministicJsonStringify(obj) {
    var iterateArray, iterateObject;

    iterateArray = function(arr) {
      var newArr = [];
      arr.forEach(function(item, index) {
        if (item !== null && typeof item === 'object') {
          newArr[index] = iterateObject(item);
        } else if (item !== null && item.constructor !== undefined && item.constructor === [].constructor) {
          newArr[index] = iterateArray(item);
        } else {
          newArr[index] = item;
        }
      });

      return newArr;
    };

    iterateObject = function(obj) {
      var keys = Object.keys(obj);
      keys.sort();

      var sortedObj = {};
      keys.forEach(function(key) {
        if (obj[key] !== null && typeof obj[key] === 'object') {
          sortedObj[key] = iterateObject(obj[key]);
        } else if (obj[key] !== null && obj[key].constructor !== undefined && obj[key].constructor === [].constructor) {
          sortedObj[key] = iterateArray(obj[key]);
        } else {
          sortedObj[key] = obj[key];
        }
      });

      return sortedObj;
    };

    if (obj === null || typeof obj !== 'object') {
      return '';
    }

    return JSON.stringify(iterateObject(obj));
  }

  function matchNamedParamsInPath(availablePath, expectedPath) {
    var expectedPathRegExp = new RegExp(
      expectedPath.replace(/\/:[^/]+/g, '/[^/]+')
    );
    return expectedPathRegExp.test(availablePath);
  }

  function matchNamedParamsInParamsAndData(availableRequest, expectedRequest) {
    var expectedParamsRegExp = null;
    if (expectedRequest.params !== undefined) {
      expectedParamsRegExp = new RegExp(
        deterministicJsonStringify(expectedRequest.params)
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          .replace(
            /\\\{\\\{:[^}:]+\\\}\\\}/g,
            '[^"\']+?' // Not 100% correct, but should work most of the time!
          )
      );
    }

    var expectedDataRegExp = null;
    if (expectedRequest.data !== undefined) {
      expectedDataRegExp = new RegExp(
        deterministicJsonStringify(expectedRequest.data)
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          .replace(
            /\\\{\\\{:[^}:]+\\\}\\\}/g,
            '[^"\']+?' // Not 100% correct, but should work most of the time!
          )
      );
    }

    if (expectedParamsRegExp !== null && availableRequest.params === undefined) {
      console.log('1');
      return false;
    }
    if (expectedDataRegExp !== null && availableRequest.data === undefined) {
      console.log('2');
      return false;
    }

    if (expectedParamsRegExp !== null) {
      if (!expectedParamsRegExp.test(deterministicJsonStringify(availableRequest.params))) {
        console.log('3');
        return false;
      }
    }

    if (expectedDataRegExp !== null) {
      if (!expectedDataRegExp.test(deterministicJsonStringify(availableRequest.data))) {
        return false;
      }
    }

    return true;
  }

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
    compare: function compare(mockedRequests, namedParamsRequest) {
      return {
        pass: containsNamedParamsRequest(mockedRequests, namedParamsRequest),
        message: `NamedParamsRequest is no part of mocked requests:\n ${JSON.stringify(namedParamsRequest, undefined, 2)}\nnot found in\n${JSON.stringify(mockedRequests, undefined, 2)}`,
      };
    },
  };
};
