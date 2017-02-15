import clone from 'lodash.clone';

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

    /**
     * @type {Array.<string>|null}
     */
    this.groupIds = labeledThingGroupDocument.groupIds;
  }

  /**
   * @return {{id: string, groupType: string}}
   */
  toJSON() {
    return {
      id: this.id,
      groupType: this.type,
      groupIds: clone(this.groupIds),
    };
  }
}

export default LabeledThingGroup;
