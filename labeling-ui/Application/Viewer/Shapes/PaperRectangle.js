import paper from 'paper';

class PaperRectangle extends paper.Group {
  constructor(shapeId, labeledThingInFrameId, topLeft, bottomRight, strokeColor) {
    super();
    super.initialize();

    this._shapeId = shapeId;
    this.labeledThingInFrameId = labeledThingInFrameId;

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

  get id() {
    return this._shapeId;
  }

  select() {
    this._rectangle.selected = true;
  }

  deselect() {
    this._rectangle.selected = false;
  }

  moveTo(point) {
    this.position = point;
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
