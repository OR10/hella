import PaperPath from './PaperPath';

/**
 * @extends PaperPath
 */
class PaperLine extends PaperPath {
  toJSON() {
    const points = this._shape.segments.map((segment) => {
      return {
        x: Math.round(segment.point.x),
        y: Math.round(segment.point.y),
      };
    });

    return {
      type: 'line',
      id: this._shapeId,
      labeledThingInFrame: this.labeledThingInFrame.id,
      points,
    };
  }
}

export default PaperLine;
