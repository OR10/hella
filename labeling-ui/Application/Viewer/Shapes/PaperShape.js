import paper from 'paper';
class PaperShape extends paper.Group {
  constructor(shapeId, labeledThingInFrameId) {
    super();
    // This needs to be called due to how PaperJS does inheritance
    super.initialize();

    this._shapeId = shapeId;
    this.labeledThingInFrameId = labeledThingInFrameId;
  }

  get id() {
    return this._shapeId;
  }

  moveTo(point) {
    this.position = point;
  }
}

export default PaperShape;
