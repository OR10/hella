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
    this.classes = labeledThingGroupInFrameDocument.classes;
  }

  /**
   * @return {{id: string, frameIndex: int, classes: Array.<string>}}
   */
  toJSON() {
    return {
      id: this.id,
      frameIndex: this.frameIndex,
      classes: this.classes,
    };
  }
}

export default LabeledThingGroupInFrame;
