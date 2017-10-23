import paper from 'paper';
import PaperPath from './PaperPath';
/**
 * @extends PaperPath
 */
class PaperPolyline extends PaperPath {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} shapeId
   * @param {Array.<Point>} points
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, points = [], color) {
    super(labeledThingInFrame, shapeId, points, color);
    this._drawShape();
  }

  /**
   * @returns {paper.Path}
   * @protected
   */
  _createShape() {
    return new paper.Path({
      strokeColor: this._color.primary,
      selected: false,
      strokeWidth: 2,
      closed: false,
      dashArray: this.dashArray,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: this._points,
    });
  }

  /**
   * @return {boolean}
   */
  canBeInterpolated() {
    return true;
  }

  /**
   * @return {boolean}
   */
  canBeSliced() {
    return true;
  }

  /**
   * @return {boolean}
   */
  hasStartAndEndFrame() {
    return true;
  }

  /**
   * @return {boolean}
   */
  canChangeFrameRange() {
    return true;
  }

  /**
   * @return {boolean}
   */
  playInFrameRange() {
    return true;
  }

  /**
   * @returns {string}
   */
  getClass() {
    return PaperPolyline.getClass();
  }

  toJSON() {
    const points = this._points.map(point => {
      return {
        x: Math.round(point.x),
        y: Math.round(point.y),
      };
    });

    return {
      type: 'polyline',
      id: this._shapeId,
      points,
    };
  }
}

/**
 * @returns {string}
 */
PaperPolyline.getClass = () => {
  return 'polyline';
};

export default PaperPolyline;
