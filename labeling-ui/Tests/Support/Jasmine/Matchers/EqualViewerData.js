module.exports = function equalViewerData() {
  function equalDimensions(lhs, rhs) {
    return lhs.height === rhs.height && lhs.width === rhs.width;
  }

  function equalData(actual, expected) {
    for (let index = 0; index < actual.length; index++) {
      if (actual[index] !== expected[index] && Math.abs(actual[index] - expected[index]) > 0) {
        return false;
      }
    }

    return true;
  }

  function equalImageData(actual, expected) {
    return equalDimensions(actual, expected) && equalData(actual.data, expected.data);
  }

  return {
    compare: function compare(actual, expected) {
      const result = {pass: true};

      Object.keys(expected).forEach((key) => {
        if (!equalImageData(expected[key], actual[key])) {
          result.pass = false;
        }
      });

      if (result.pass) {
        result.message = 'Expected viewer stages not to be equal.';
      } else {
        result.message = 'Expected viewer stages to be equal.';
      }

      result.expected = expected;
      result.actual = actual;

      return result;
    },
  };
};
