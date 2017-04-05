import PaperShape from './PaperShape';

class PaperThingShape extends PaperShape {

  /**
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingInFrame, shapeId, color) {
    super(shapeId, color);

    /**
     * {@link LabeledThingInFrame} associated with this `PaperThingShape`
     *
     * @type {LabeledThingInFrame}
     * @private
     */
    this._labeledThingInFrame = labeledThingInFrame;
  }


  /**
   * {@link LabeledThingInFrame} associated with this `PaperThingShape`
   *
   * @returns {LabeledThingInFrame}
   */
  get labeledThingInFrame() {
    return this._labeledThingInFrame;
  }
}

export default PaperThingShape;
