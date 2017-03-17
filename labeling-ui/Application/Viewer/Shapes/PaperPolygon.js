import paper from 'paper';
import PaperShape from './PaperShape';
import PaperPath from "./PaperPath";

/**
 * @extends PaperPath
 */
class PaperPolygon extends PaperPath {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   * @param {boolean} draft
   * @param {boolean} isClosed
   */
  constructor(labeledThingInFrame, shapeId, points = [], color, draft = false) {
    super(labeledThingInFrame, shapeId, points, color, draft);
    this._drawShape();
  }

  /**
   * @param {Boolean} drawHandles
   * @private
   */
  _drawShape(drawHandles = true) {
    super.drawShape(this._createShape(), drawHandles);
  }

  /**
   * @returns {Path}
   * @private
   */
  _createShape() {
    return new paper.Path({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      closed: false,
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
      labeledThingInFrameId: this.labeledThingInFrame.id,
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
