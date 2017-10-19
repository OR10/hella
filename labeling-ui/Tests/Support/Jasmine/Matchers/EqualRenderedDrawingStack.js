import CanteenStackRenderer from './CanteenStackRenderer.es5';

var renderer = new CanteenStackRenderer('black');

module.exports = function toEqualRenderedDrawingStack() {
  function equalDimensions(lhs, rhs) {
    return (lhs.height === rhs.height && lhs.width === rhs.width);
  }

  function equalStack(actual, expected) {
    var actualCanvas = renderer.render(actual),
      expectedCanvas = renderer.render(expected);

    var actualCanvasImageData = actualCanvas.getContext('2d').getImageData(0, 0, actualCanvas.width, actualCanvas.height),
      expectedCanvasImageData = expectedCanvas.getContext('2d').getImageData(0, 0, expectedCanvas.width, expectedCanvas.height);

    for (var i = 0; i < actualCanvasImageData.data.length; i++) {
      if (actualCanvasImageData.data[i] !== expectedCanvasImageData.data[i]) {
        return false;
      }
    }

    return true;
  }

  function equalRenderedDrawingStack(actual, expected) {
    return (equalDimensions(actual, expected) && equalStack(actual, expected));
  }

  return {
    compare: function compare(actual, expected) {
      const result = {pass: true};

      if (!equalRenderedDrawingStack(actual, expected)) {
        result.pass = false;
      }

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
