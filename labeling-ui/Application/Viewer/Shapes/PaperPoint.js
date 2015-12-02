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
   */
  constructor(labeledThingInFrame, shapeId, position, strokeColor) {
    super(labeledThingInFrame, shapeId, position, 1, strokeColor);
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
