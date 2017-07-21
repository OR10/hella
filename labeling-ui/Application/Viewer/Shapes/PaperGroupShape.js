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
   * Is called when the linked shape is modified to redraw all necessary group parts
   */
  update() {
  }

  /**
   * @return {boolean}
   */
  canBeInterpolated() {
    return false;
  }


  /**
   * {@link LabeledThingGroup} associated with this `PaperGroupShape`
   *
   * @returns {LabeledThingGroup}
   */
  get labeledThingGroupInFrame() {
    return this._labeledThingGroupInFrame;
  }

  /**
   * Get the Groups Group ID
   *
   * @returns {string}
   */
  get groupId() {
    return this.labeledThingGroupInFrame.labeledThingGroup.id;
  }
}

export default PaperGroupShape;
