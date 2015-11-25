import paper from 'paper';

class PaperRectangle extends paper.Group {
  constructor(shapeId, labeledThingInFrame, topLeft, bottomRight, strokeColor) {
    super();
    super.initialize();

    this._shapeId = shapeId;
    this._labeledThingInFrame = labeledThingInFrame;

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
      topLeft,
      bottomRight,
      labeledThingInFrameId: this._labeledThingInFrame.id,
    };
  }
}

export default PaperRectangle;
