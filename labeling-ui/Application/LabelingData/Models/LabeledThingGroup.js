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
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {type, lineColor, groupIds} = this;
    return Object.assign(super.toJSON(), {
      groupType: type,
      lineColor: lineColor,
      groupIds: clone(groupIds),
    });
  }

  /**
   * @return {LabeledThingGroup}
   */
  clone() {
    return new LabeledThingGroup({
      id: this.id,
      classes: this.classes,
      incomplete: this.incomplete,
      task: this.task,
      // Remapping of type => groupType
      groupType: this.type,
      lineColor: this.lineColor,
      groupIds: this.groupIds,
    });
  }
}

export default LabeledThingGroup;
