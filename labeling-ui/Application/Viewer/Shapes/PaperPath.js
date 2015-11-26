import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @class PaperPath
 * @extends PaperShape
 */
class PaperPath extends PaperShape {
  constructor(shapeId, labeledThingId, points, strokeColor) {
    super(shapeId, labeledThingId);

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
      labeledThingInFrameId: this.labeledThingInFrameId,
      points,
    };
  }

  add() {
    this._shape.add.apply(this._shape, arguments);
  }
}

export default PaperPath;
