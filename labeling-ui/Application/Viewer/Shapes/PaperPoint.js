import PaperCircle from '../Shapes/PaperCircle';

/**
 * @extends PaperCircle
 */
class PaperPoint extends PaperCircle {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Point} position
   * @param {String} strokeColor
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, position, strokeColor, draft) {
    super(labeledThingInFrame, shapeId, position, 1, strokeColor, draft);
  }

  toJSON() {
    const {position} = this._shape;

    return {
      type: 'point',
      id: this._shapeId,
      point: {x: position.x, y: position.y},
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

export default PaperPoint;
