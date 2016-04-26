/**
 * AUTO GENERATED ES5 VERSION OF THE FILE "Support/Console/CanteenStackRenderer.js"
 *
 * "# babel --presets="/usr/local/lib/node_modules/babel-preset-es2015/index.js" CanteenStackRenderer.js > CanteenStackRenderer.es5.js"
 *
 * DO NOT EDIT !!! DO NOT TOUCH !!!
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _canvas = require('canvas');

var _canvas2 = _interopRequireDefault(_canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Render utillity to create a filled Canvas based on canteen stack output
 */

var CanteenStackRenderer = function () {
  /**
   * @param {String} background
   */

  function CanteenStackRenderer(background) {
    _classCallCheck(this, CanteenStackRenderer);

    /**
     * @type {String}
     * @private
     */
    this._background = background;
  }

  /**
   * Render the given stack information into a canvas
   *
   * @param {Array.<Object>} drawingStack
   * @return {Canvas}
   */


  _createClass(CanteenStackRenderer, [{
    key: 'render',
    value: function render(drawingStack) {
      var canvas = new _canvas2.default(drawingStack.width, drawingStack.height);
      var ctx = canvas.getContext('2d');

      ctx.save();
      ctx.fillStyle = this._background;
      ctx.clearRect(0, 0, drawingStack.width, drawingStack.height);
      ctx.restore();

      this._visitOperations(ctx, drawingStack.operations);

      return canvas;
    }

    /**
     * Visit a canteen stack rendering it to the given context
     * @param {Context} ctx
     * @param {Array.<Object>} stack
     * @private
     */

  }, {
    key: '_visitOperations',
    value: function _visitOperations(ctx, stack) {
      var _this = this;

      stack.forEach(function (operation) {
        return _this._visitOperation(ctx, operation);
      });
    }

    /**
     * Visit an arbitrary canvas operation from within the stack
     *
     * @param {Context} ctx
     * @param {Object} operation
     * @private
     */

  }, {
    key: '_visitOperation',
    value: function _visitOperation(ctx, operation) {
      switch (true) {
        case operation.method !== undefined:
          this._visitMethodCallOperation(ctx, operation);
          break;
        case operation.attr !== undefined:
          this._visitAttributeSetterOperation(ctx, operation);
          break;
        default:
          throw new Error('Unknown operation: ' + operation);
      }
    }

    /**
     * Visit a method call to the context
     *
     * @param {Context} ctx
     * @param {Object} operation
     * @private
     */

  }, {
    key: '_visitMethodCallOperation',
    value: function _visitMethodCallOperation(ctx, operation) {
      ctx[operation.method].apply(ctx, operation.arguments);
    }

    /**
     * Visit a setter for an attribute
     *
     * @param {Context} ctx
     * @param {Object} operation
     * @private
     */

  }, {
    key: '_visitAttributeSetterOperation',
    value: function _visitAttributeSetterOperation(ctx, operation) {
      ctx[operation.attr] = operation.val;
    }
  }]);

  return CanteenStackRenderer;
}();

exports.default = CanteenStackRenderer;

