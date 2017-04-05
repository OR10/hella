import PaperShape from './PaperShape';

class PaperGroupShape extends PaperShape {

  /**
   *
   * @param {LabeledThingGroupInFrame} labeledThingGroupInFrame
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   */
  constructor(labeledThingGroupInFrame, shapeId, color) {
    super(shapeId, color);

    /**
     * {@link LabeledThingGroup} associated with this `PaperGroupShape`
     *
     * @type {LabeledThingGroup}
     * @protected
     */
    this._labeledThingGroupInFrame = labeledThingGroupInFrame;
  }


  /**
   * {@link LabeledThingGroup} associated with this `PaperGroupShape`
   *
   * @returns {LabeledThingGroup}
   */
  get labeledThingGroupInFrame() {
    return this._labeledThingGroupInFrame;
  }
}

export default PaperGroupShape;
