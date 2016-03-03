module.exports = function toEqualDrawingStack() {
  function equalDimensions(lhs, rhs) {
    return lhs.height === rhs.height && lhs.width === rhs.width;
  }

  function equalStack(actual, expected) {
    return JSON.stringify(expected) === JSON.stringify(actual);
  }

  function equalDrawingStack(actual, expected) {
    return equalDimensions(actual, expected) && equalStack(actual.operations, expected.operations);
  }

  return {
    compare: function compare(actual, expected) {
      const result = {pass: true};

      Object.keys(expected).forEach((key) => {
        if (!equalDrawingStack(expected[key], actual[key])) {
          result.pass = false;
        }
      });

      if (result.pass) {
        result.message = 'Expected drawing stacks not to be equal.';
      } else {
        result.message = 'Expected drawing stacks to be equal.';
      }

      result.expected = expected;
      result.actual = actual;

      return result;
    },
  };
};
