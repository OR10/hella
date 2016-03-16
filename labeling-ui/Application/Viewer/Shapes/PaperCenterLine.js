import PaperPath from './PaperPath';

/**
 * @extends PaperPath
 */
class PaperCenterLine extends PaperPath {
  constructor(labeledThingInFrame, shapeId, from, to, color, draft = false) {
    const points = [from, to];
    super(labeledThingInFrame, shapeId, points, color, draft);
  }

  toJSON() {
    const points = this._shape.segments.map((segment) => {
      return {
        x: Math.round(segment.point.x),
        y: Math.round(segment.point.y),
      };
    });

    return {
      type: 'center-line',
      id: this._shapeId,
      labeledThingInFrame: this.labeledThingInFrame.id,
      points,
    };
  }
}

export default PaperCenterLine;
