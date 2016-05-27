import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @extends PaperShape
 */
class PaperRectangle extends PaperShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {String} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, topLeft, bottomRight, color, draft = false) {
    super(labeledThingInFrame, shapeId, draft);
    /**
     * @type {Point}
     * @private
     */
    this._topLeft = topLeft;
    
    /**
     * @type {Point}
     * @private
     */
    this._bottomRight = bottomRight;

    /**
     * @type {String}
     * @private
     */
    this._color = color;

    this._drawShape();
  }

  _drawShape(handles = false) {
    this.removeChildren();

    const shape = this._generateShape();
    this.addChild(shape);

    if (this._isSelected && handles) {
      const rectangles = this._generateHandles();
      this._addChildren(rectangles);
    }
  }

  _generateShape() {
    return new paper.Path.Rectangle({
      strokeColor: this._color,
      selected: false,
      strokeWidth: 2,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: this._topLeft,
      to: this._bottomRight,
    });
  }

  _generateHandles() {
    const handlePoints = [
      {name: 'top-left', point: this._topLeft},
      {name: 'top-right', point: new paper.Point(this._bottomRight.x, this._topLeft.y)},
      {name: 'bottom-right', point: this._bottomRight},
      {name: 'bottom-left', point: new paper.Point(this._topLeft.x, this._bottomRight.y)},
    ];

    return handlePoints.map(handle => {
      const rectangle = {
        topLeft: new paper.Point(
          handle.point.x - this._handleSize / 2,
          handle.point.y - this._handleSize / 2,
        ),
        bottomRight: new paper.Point(
          handle.point.x + this._handleSize / 2,
          handle.point.y + this._handleSize / 2,
        ),
      };

      return new paper.Path.Rectangle({
        name: handle.name,
        rectangle,
        selected: false,
        strokeWidth: 0,
        strokeScaling: false,
        fillColor: '#ffffff',
      });
    });
  }

  /**
   * Select the shape
   *
   * @param {Boolean} handles
   */
  select(handles = true) {
    this._isSelected = true;
    this._drawShape(handles);
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this._drawShape();
  }

  toJSON() {
    return {
      type: 'rectangle',
      id: this._shapeId,
      topLeft: {
        x: Math.round(this._topLeft.x),
        y: Math.round(this._topLeft.y),
      },
      bottomRight: {
        x: Math.round(this._bottomRight.x),
        y: Math.round(this._bottomRight.y),
      },
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

export default PaperRectangle;
