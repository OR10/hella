import paper from 'paper';
import PaperShape from './PaperShape';

class PaperRectangle extends PaperShape {
  constructor(shapeId, labeledThingInFrameId, topLeft, bottomRight, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._shape = new paper.Path.Rectangle({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: topLeft,
      to: bottomRight,
    });

    this.addChild(this._shape);
  }

  toJSON() {
    const {topLeft, bottomRight} = this.bounds;

    return {
      type: 'rectangle',
      id: this._shapeId,
      topLeft: {x: topLeft.x, y: topLeft.y},
      bottomRight: {x: bottomRight.x, y: bottomRight.y},
      labeledThingInFrameId: this.labeledThingInFrameId,
    };
  }
}

export default PaperRectangle;
