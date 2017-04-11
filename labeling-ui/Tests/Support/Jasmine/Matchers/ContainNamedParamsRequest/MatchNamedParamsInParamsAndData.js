var deterministicJsonStringify = require('./DeterministicJsonStringify');

module.exports = function matchNamedParamsInParamsAndData(availableRequest, expectedRequest) {
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
    return false;
  }
  if (expectedDataRegExp !== null && availableRequest.data === undefined) {
    return false;
  }

  if (expectedParamsRegExp !== null) {
    if (!expectedParamsRegExp.test(deterministicJsonStringify(availableRequest.params))) {
      return false;
    }
  }

  if (expectedDataRegExp !== null) {
    if (!expectedDataRegExp.test(deterministicJsonStringify(availableRequest.data))) {
      return false;
    }
  }

  return true;
};