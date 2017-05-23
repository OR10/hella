import {clone} from 'lodash';
import LabeledObject from './LabeledObject';

class LabeledThingGroup extends LabeledObject {
  /**
   *
   * @param {Object} labeledThingGroupDocument
   */
  constructor(labeledThingGroupDocument) {
    super(labeledThingGroupDocument);

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
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {type, task, lineColor, groupIds} = this;
    return Object.assign(super.toJSON(), {
      groupType: type,
      lineColor: lineColor,
      groupIds: clone(groupIds),
      taskId: task.id,
    });
  }
}

export default LabeledThingGroup;
