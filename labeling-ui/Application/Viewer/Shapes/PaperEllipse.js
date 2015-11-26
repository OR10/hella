import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @class PaperEllipse
 * @extends PaperShape
 */
class PaperEllipse extends PaperShape {
  constructor(shapeId, labeledThingInFrameId, center, size, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._shape = new paper.Path.Ellipse({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      size,
      center,
    });

    this.addChild(this._shape);
  }

  toJSON() {
    const {bounds, position} = this._shape;

    return {
      type: 'ellipse',
      id: this._shapeId,
      point: {x: Math.round(position.x), y: Math.round(position.y)},
      size: {width: Math.round(bounds.width), height: Math.round(bounds.height)},
      labeledThingInFrameId: this.labeledThingInFrameId,
    };
  }
}

export default PaperEllipse;
