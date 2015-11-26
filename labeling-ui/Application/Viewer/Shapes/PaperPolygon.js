import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @class PaperPolygon
 * @extends PaperShape
 */
class PaperPolygon extends PaperShape {
  /**
   * @param {String} shapeId
   * @param {String} labeledThingInFrameId
   * @param {Array.<Point>} points
   * @param {String} strokeColor
   */
  constructor(shapeId, labeledThingInFrameId, points, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._shape = new paper.Path({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      segments: points,
      closed: true,
    });

    this.addChild(this._shape);
  }

  toJSON() {
    const points = this._shape.segments.map((segment) => {
      return {
        x: Math.round(segment.point.x),
        y: Math.round(segment.point.y),
      };
    });

    return {
      type: 'polygon',
      id: this._shapeId,
      labeledThingInFrameId: this.labeledThingInFrameId,
      points,
    };
  }

  add() {
    this._shape.add.apply(this._shape, arguments);
  }
}

export default PaperPolygon;
