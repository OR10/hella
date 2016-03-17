import Tool from './Tool';
import paper from 'paper';
import PaperCircle from '../Shapes/PaperCircle';
import PaperPedestrian from '../Shapes/PaperPedestrian';

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

    /**
     * Variable that holds the string representation of the drag handle position
     *
     * @type {string}
     * @private
     */
    this._boundName = null;

    /**
     * Position of the initial mousedown of one certain scaling operation
     *
     * @type {paper.Point|null}
     * @private
     */
    this._startPoint = null;
  }

  onMouseDown(event, hitResult) {
    const point = event.point;

    this._startPoint = point;

    this._hitResult = hitResult;

    if (hitResult.name) {
      this._boundName = hitResult.name;
    } else {
      this._boundName = null;
    }

    if (this._hitResult.type === 'bounds') {
      switch (true) {
        case this._hitResult.item instanceof PaperCircle:
          this._scaleAnchor = this._getCircleScaleAnchor(point, this._hitResult.item);
          break;
        case this._hitResult.item instanceof PaperPedestrian:
          this._scaleAnchor = this._getPedestrianScaleAnchor(point, this._hitResult.item);
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
    this._startPoint = null;
  }

  onMouseDrag(event) {
    if (!this._hitResult || this._hitResult.type !== 'bounds' || this._scaleAnchor === null) {
      return;
    }
    const point = event.point;

    this._modified = true;

    this._$scope.$apply(() => {
      switch (true) {
        case this._hitResult.item instanceof PaperCircle:
          this._scaleCircle(this._hitResult.item, point);
          break;
        case this._hitResult.item instanceof PaperPedestrian:
          this._scalePedestrian(this._hitResult.item, point);
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

    this._scaleAnchor = this._getScaleAnchor();
    item.scale(scaleX, scaleY, this._scaleAnchor);
  }

  _scalePedestrian(pedestrian, point) {
    const {topCenter, bottomCenter} = pedestrian.getCenterPoints();

    const scaleFactor = Math.abs(this._scaleAnchor.y - point.y) / Math.abs(bottomCenter.y - topCenter.y);
    if (scaleFactor !== 0) {
      pedestrian.scale(1, scaleFactor, this._scaleAnchor);
    }

    if ((this._scaleAnchor.isClose(topCenter, 0.0001) && point.y < topCenter.y) ||
      (this._scaleAnchor.isClose(bottomCenter, 0.0001) && point.y > bottomCenter.y)) {
      pedestrian.flipHorizontally(this._scaleAnchor);
    }
  }

  _scaleCircle(item, dragPoint) {
    const width = Math.abs(dragPoint.x - this._scaleAnchor.x) || 1;
    const height = Math.abs(dragPoint.y - this._scaleAnchor.y) || 1;

    const scaleX = width / item.bounds.width || 1;
    const scaleY = height / item.bounds.height || 1;
    const scale = Math.max(scaleX, scaleY);

    item.scale(scale, scale, this._scaleAnchor);

    this._scaleAnchor = this._getCircleScaleAnchor();
  }

  _getScaleAnchor() {
    switch (this._boundName) {
      case 'top-left':
        return this._hitResult.item.bounds.bottomRight;
        break;
      case 'top-right':
        return this._hitResult.item.bounds.bottomLeft;
        break;
      case 'bottom-left':
        return this._hitResult.item.bounds.topRight;
        break;
      case 'bottom-right':
        return this._hitResult.item.bounds.topLeft;
        break;
      case 'top-center':
      case 'right-center':
      case 'bottom-center':
      case 'left-center':
      default:
        return null;
    }
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

  _getPedestrianScaleAnchor(point, pedestrian) {
    const {topCenter, bottomCenter} = pedestrian.getCenterPoints();

    if (point.y >= topCenter.y - 8 && point.y <= topCenter.y + 8) {
      return bottomCenter;
    } else {
      return topCenter;
    }

  }
}
