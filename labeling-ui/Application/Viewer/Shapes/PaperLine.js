import paper from 'paper';
import PaperPath from './PaperPath';

/**
 * @class PaperLine
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
      labeledThingInFrameId: this.labeledThingInFrameId,
      points,
    };
  }
}

export default PaperPath;
