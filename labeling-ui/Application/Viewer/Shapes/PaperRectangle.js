import paper from 'paper';
import PaperShape from './PaperShape';

/**
 * @extends PaperShape
 */
class PaperRectangle extends PaperShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Point} topLeft
   * @param {Point} bottomRight
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, topLeft, bottomRight, draft = false) {
    super(labeledThingInFrame, shapeId, draft);

    this._shape = new paper.Path.Rectangle({
      strokeColor: this._strokeColor,
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
    const {topLeft, bottomRight} = this._shape.bounds;

    return {
      type: 'rectangle',
      id: this._shapeId,
      topLeft: {
        x: Math.round(topLeft.x),
        y: Math.round(topLeft.y),
      },
      bottomRight: {
        x: Math.round(bottomRight.x),
        y: Math.round(bottomRight.y),
      },
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

export default PaperRectangle;
