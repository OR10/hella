class LabeledThingGroup {
  /**
   *
   * @param {Object} labeledThingGroupDocument
   */
  constructor(labeledThingGroupDocument) {
    /**
     * @type {string}
     */
    this.id = labeledThingGroupDocument.id;

    /**
     * @type {string}
     */
    this.type = labeledThingGroupDocument.groupType;
  }

  /**
   * @return {{id: string, groupType: string}}
   */
  toJSON() {
    return {
      id: this.id,
      groupType: this.type,
    };
  }
}

export default LabeledThingGroup;
