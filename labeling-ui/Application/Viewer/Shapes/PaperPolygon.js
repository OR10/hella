import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @extends PaperShape
 */
class PaperPolygon extends PaperShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Array.<Point>} points
   * @param {String} strokeColor
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, points, strokeColor, draft) {
    super(labeledThingInFrame, shapeId, draft);

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
      labeledThingInFrameId: this.labeledThingInFrame.id,
      points,
    };
  }

  add() {
    this._shape.add.apply(this._shape, arguments);
  }
}

export default PaperPolygon;
