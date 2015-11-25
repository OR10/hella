import paper from 'paper';
import PaperShape from './PaperShape';

class PaperRectangle extends PaperShape {
  constructor(shapeId, labeledThingInFrameId, topLeft, bottomRight, strokeColor) {
    super(shapeId, labeledThingInFrameId);

    this._rectangle = new paper.Path.Rectangle({
      strokeColor,
      selected: false,
      strokeWidth: 2,
      strokeScaling: false,
      fillColor: new paper.Color(0, 0, 0, 0),
      from: topLeft,
      to: bottomRight,
    });

    this.addChild(this._rectangle);
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

  select() {
    this._rectangle.selected = true;
  }

  deselect() {
    this._rectangle.selected = false;
  }
}

export default PaperRectangle;
