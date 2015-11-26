import PaperCircle from '../Shapes/PaperCircle';

/**
 * @class PaperPoint
 * @extends PaperCircle
 */
class PaperPoint extends PaperCircle {
  /**
   * @param {String} shapeId
   * @param {String} labeledThingInFrameId
   * @param {Point} position
   * @param {String} strokeColor
   */
  constructor(shapeId, labeledThingInFrameId, position, strokeColor) {
    super(shapeId, labeledThingInFrameId, position, 1, strokeColor);
  }

  toJSON() {
    const {position} = this._shape;

    return {
      type: 'point',
      id: this._shapeId,
      point: {x: position.x, y: position.y},
      labeledThingInFrameId: this.labeledThingInFrameId,
    };
  }
}

export default PaperPoint;
