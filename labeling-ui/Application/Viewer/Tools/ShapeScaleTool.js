import Tool from './Tool';

/**
 * A Tool for scaling annotation shapes
 */
export default class ShapeScaleTool extends Tool {
  /**
   * @param {DrawingContext} drawingContext
   * @param {Object} options
   * @param {Map} typeByPaperShapeId
   */
  constructor(drawingContext, options, typeByPaperShapeId) {
    super(drawingContext, options);
    /**
     * Hit test result
     *
     * @type {HitResult}
     * @private
     */
    this._hitResult = null;
    /**
     * Shape type of the hit result
     *
     * @type {string}
     * @private
     */
    this._hitType = null;
    /**
     * Variable that holds the modified state of the current rectangle
     *
     * @type {boolean}
     * @private
     */
    this._modified = false;

    this._typeByPaperShapeId = typeByPaperShapeId;

    this._tool.onMouseDown = this._mouseDown.bind(this);
    this._tool.onMouseUp = this._mouseUp.bind(this);
    this._tool.onMouseDrag = this._mouseDrag.bind(this);
  }

  _mouseDown(event) {
    const point = new paper.Point(event.event.offsetX, event.event.offsetY);
    this._deselectCurrentSelection();

    this._context.withScope(scope => {
      const hitResult = scope.project.hitTest(point, {
        fill: true,
        bounds: true,
        tolerance: this._options.hitTestTolerance,
      });

      if (hitResult) {
        this._hitResult = hitResult;
        this._hitResult.item.selected = true;
        this._hitType = this._typeByPaperShapeId.get(hitResult.item.id);

        if (this._hitResult.type === 'bounds') {
          switch (this._hitType) {
            case 'circle':
              this._scaleAnchor = this._getCircleScaleAnchor(point, this._hitResult.item);
              break;
            default:
              this._scaleAnchor = this._getScaleAnchor(point, this._hitResult.item);
          }
        }
      } else {
        this._hitResult = null;
      }
    });
  }

  _deselectCurrentSelection() {
    if (this._hitResult && this._hitResult.item) {
      this._hitResult.item.selected = false;
    }
  }

  _mouseUp() {
    if (this._hitResult && this._hitResult.item) {
      if (this._modified) {
        this.emit('shape:update', this._hitResult.item);
        this._modified = false;
      } else {
        this.emit('shape:selected', this._hitResult.item);
      }
    } else {
      this.emit('shape:deselected');
    }

    this._scaleAnchor = null;
  }

  _mouseDrag(event) {
    if (!this._hitResult || this._hitResult.type !== 'bounds') return;
    const point = new paper.Point(event.event.offsetX, event.event.offsetY)

    this._modified = true;
    switch (this._hitType) {
      case 'circle':
        this._scaleCircle(this._hitResult.item, point);
        break;
      default:
        this._scale(this._hitResult.item, point);
    }
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
      } else {
        return new paper.Point(item.bounds.right, item.position.y);
      }
    } else {
      // Scale on y axis
      if (dragHandle.y > item.position.y) {
        return new paper.Point(item.position.x, item.bounds.top);
      } else {
        return new paper.Point(item.position.x, item.bounds.bottom);
      }
    }
  }
}
