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
  constructor(labeledThingInFrame, shapeId, points = [], color, draft = false, isClosed = true) {
    super(labeledThingInFrame, shapeId, points, color, draft, isClosed)
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
