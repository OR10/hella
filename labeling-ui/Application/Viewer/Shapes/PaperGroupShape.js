import PaperShape from './PaperShape';

class PaperGroupShape extends PaperShape {

  /**
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @param {String} shapeId
   * @param {{primary: string, secondary: string}} color
   * @param {boolean?} draft
   */
  constructor(labeledThingGroup, shapeId, color, draft = false) {
    super(shapeId, color, draft);

    /**
     * {@link LabeledThingGroup} associated with this `PaperGroupShape`
     *
     * @type {LabeledThingGroup}
     * @private
     */
    this._labeledThingGroup = labeledThingGroup;
  }


  /**
   * {@link LabeledThingGroup} associated with this `PaperGroupShape`
   *
   * @returns {LabeledThingGroup}
   */
  get labeledThingGroup() {
    return this._labeledThingGroup;
  }
}

export default PaperGroupShape;
