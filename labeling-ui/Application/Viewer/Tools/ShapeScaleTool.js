import Tool from './Tool';
import paper from 'paper';
import PaperCircle from '../Shapes/PaperCircle';

/**
 * A Tool for scaling annotation shapes
 *
 * @implements ToolEvents
 */
export default class ShapeScaleTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} [options]
   */
  constructor($scope, drawingContext, options) {
    super(drawingContext, options);
    /**
     * @type {angular.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * Hit test result
     *
     * @type {HitResult}
     * @private
     */
    this._hitResult = null;

    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;
  }

  onMouseDown(event, hitResult) {
    const point = event.point;

    this._hitResult = hitResult;

    if (this._hitResult.type === 'bounds') {
      switch (true) {
        case this._hitResult.item instanceof PaperCircle:
          this._scaleAnchor = this._getCircleScaleAnchor(point, this._hitResult.item);
          break;
        default:
          this._scaleAnchor = this._getScaleAnchor(point, this._hitResult.item);
      }
    }
  }

  onMouseUp() {
    if (this._hitResult && this._hitResult.item) {
      if (this._modified) {
        this._modified = false;
        this.emit('shape:update', this._hitResult.item);
      }
    }

    this._scaleAnchor = null;
  }

  onMouseDrag(event) {
    if (!this._hitResult || this._hitResult.type !== 'bounds') {
      return;
    }
    const point = event.point;

    this._modified = true;

    this._$scope.$apply(() => {
      switch (true) {
        case this._hitResult.item instanceof PaperCircle:
          this._scaleCircle(this._hitResult.item, point);
          break;
        default:
          this._scale(this._hitResult.item, point);
      }
    });
  }

  /**
   * TODO: If the drag handle is dragged fast over the scale anchor the scale anchor
   * moves in the opposite of the drag direction.
   * The movement size is speed dependent!
   */
  _scale(item, dragPoint) {
    const width = Math.abs(dragPoint.x - this._scaleAnchor.x) || 1;
    const height = Math.abs(dragPoint.y - this._scaleAnchor.y) || 1;

    const scaleX = width / item.bounds.width || 1;
    const scaleY = height / item.bounds.height || 1;

    item.scale(scaleX, scaleY, this._scaleAnchor);

    this._scaleAnchor = this._getScaleAnchor(dragPoint, item);
  }

  _scaleCircle(item, dragPoint) {
    const width = Math.abs(dragPoint.x - this._scaleAnchor.x) || 1;
    const height = Math.abs(dragPoint.y - this._scaleAnchor.y) || 1;

    const scaleX = width / item.bounds.width || 1;
    const scaleY = height / item.bounds.height || 1;
    const scale = Math.max(scaleX, scaleY);

    item.scale(scale, scale, this._scaleAnchor);

    this._scaleAnchor = this._getCircleScaleAnchor(dragPoint, item);
  }

  _getScaleAnchor(dragHandle, item) {
    if (dragHandle.x > item.position.x && dragHandle.y > item.position.y) {
      return this._hitResult.item.bounds.topLeft;
    }

    if (dragHandle.x <= item.position.x && dragHandle.y > item.position.y) {
      return this._hitResult.item.bounds.topRight;
    }

    if (dragHandle.x <= item.position.x && dragHandle.y <= item.position.y) {
      return this._hitResult.item.bounds.bottomRight;
    }

    return this._hitResult.item.bounds.bottomLeft;
  }

  _getCircleScaleAnchor(dragHandle, item) {
    const xDiff = Math.abs(dragHandle.x - item.position.x);
    const yDiff = Math.abs(dragHandle.y - item.position.y);

    if (xDiff > yDiff) {
      // Scale on x axis
      if (dragHandle.x > item.position.x) {
        return new paper.Point(item.bounds.left, item.position.y);
      }

      return new paper.Point(item.bounds.right, item.position.y);
    }
    // Scale on y axis
    if (dragHandle.y > item.position.y) {
      return new paper.Point(item.position.x, item.bounds.top);
    }

    return new paper.Point(item.position.x, item.bounds.bottom);
  }
}
