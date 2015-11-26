import paper from 'paper';
import PaperShape from './PaperShape';

class PaperCircle extends PaperShape {
  constructor(shapeId, labeledThingInFrameId, center, radius, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._shape = new paper.Path.Circle({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      radius,
      center,
    });

    this.addChild(this._shape);
  }

  toJSON() {
    const {bounds, position} = this._shape;

    return {
      type: 'circle',
      id: this._shapeId,
      point: {x: Math.round(position.x), y: Math.round(position.y)},
      size: {width: Math.round(bounds.width), height: Math.round(bounds.height)},
      labeledThingInFrameId: this.labeledThingInFrameId,
    };
  }
}

export default PaperCircle;
