import paper from 'paper';
import PaperShape from './PaperShape';
import PaperPath from './PaperPath';

/**
 * @extends PaperPath
 */
class PaperPolygon extends PaperPath {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, points = [], color) {
    super(labeledThingInFrame, shapeId, points, color);
    this._renderShape();
  }

  /**
   * @param {Boolean} drawHandles
   * @protected
   */
  _renderShape(drawHandles = true) {
    super.drawShape(this._createShape(), drawHandles);
  }

  /**
   * @returns {paper.Path}
   * @private
   */
  _createShape() {
    return new paper.Path({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      closed: true,
      dashArray: this._isSelected ? PaperShape.DASH : PaperShape.LINE,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: this._points,
    });
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPolygon.getClass();
  }

  toJSON() {
    const points = this._points.map(point => {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
    });

    return {
      type: 'polygon',
      id: this._shapeId,
      points,
    };
  }
}

/**
 * @returns {string}
 */
PaperPolygon.getClass = () => {
  return 'polygon';
};

export default PaperPolygon;
