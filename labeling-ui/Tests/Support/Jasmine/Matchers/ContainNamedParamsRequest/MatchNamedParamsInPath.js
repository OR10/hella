module.exports = function matchNamedParamsInPath(availablePath, expectedPath) {
  var expectedPathRegExp = new RegExp(
    expectedPath.replace(/\/:[^/]+/g, '/[^/]+')
  );
  return expectedPathRegExp.test(availablePath);
};