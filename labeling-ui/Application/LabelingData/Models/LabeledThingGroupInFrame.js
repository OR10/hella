import clone from 'lodash.clone';

class LabeledThingGroupInFrame {
  /**
   * @param {Object} labeledThingGroupInFrameDocument
   */
  constructor(labeledThingGroupInFrameDocument) {
    /**
     * @type {string}
     */
    this.id = labeledThingGroupInFrameDocument.id;

    /**
     * @type {int}
     */
    this.frameIndex = labeledThingGroupInFrameDocument.frameIndex;

    /**
     * @type {Array.<string>}
     */
    this.classes = clone(labeledThingGroupInFrameDocument.classes);

    /**
     * @type {LabeledThingGroup}
     */
    this.labeledThingGroup = labeledThingGroupInFrameDocument.labeledThingGroup;
  }

  /**
   * @return {{id: string, frameIndex: int, classes: Array.<string>}}
   */
  toJSON() {
    return {
      id: this.id,
      frameIndex: this.frameIndex,
      classes: clone(this.classes),
      labeledThingGroupId: this.labeledThingGroup.id,
    };
  }
}

export default LabeledThingGroupInFrame;
