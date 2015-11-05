module.exports = function(util) {
  return {
    compare: function jayAndSilentBlob(actual, expected) {
      var result = {};

      result.pass = util.equals(actual, expected);

      if (result.pass) {
        result.message = 'Expected viewer stages not to be equal.';
      } else {
        result.message = 'Expected viewer stages to be equal.';
      }

      return result;
    }
  };
};
