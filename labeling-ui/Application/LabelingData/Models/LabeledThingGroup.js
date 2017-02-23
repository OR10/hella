import {clone} from 'lodash';

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
     * @type {Task}
     */
    this._task = labeledThingGroupDocument.task;

    /**
     * @type {string}
     */
    this.type = labeledThingGroupDocument.groupType;

    /**
     * @type {string}
     */
    this.lineColor = labeledThingGroupDocument.lineColor;

    /**
     * @type {Array.<string>|null}
     */
    this.groupIds = labeledThingGroupDocument.groupIds;
  }

  /**
   * @return {Task}
   */
  get task() {
    return this._task;
  }

  /**
   * @return {{id: string, groupType: string}}
   */
  toJSON() {
    return {
      id: this.id,
      groupType: this.type,
      lineColor: this.lineColor,
      groupIds: clone(this.groupIds),
    };
  }
}

export default LabeledThingGroup;
