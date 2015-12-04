import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @extends PaperShape
 */
class PaperPath extends PaperShape {
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
      segments: points,
      closed: false,
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
      type: 'path',
      id: this._shapeId,
      labeledThingInFrameId: this.labeledThingInFrame.id,
      points,
    };
  }

  add() {
    this._shape.add.apply(this._shape, arguments);
  }
}

export default PaperPath;
