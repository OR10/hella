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
    this.type = labeledThingGroupDocument.identifierName;

    /**
     * @type {string}
     */
    this.lineColor = labeledThingGroupDocument.lineColor;

    /**
     * @type {Array.<string>|null}
     */
    this.groupIds = labeledThingGroupDocument.groupIds;

    /**
     * @type {String}
     */
    this.createdByUserId = labeledThingGroupDocument.createdByUserId;

    /**
     * @type {String}
     */
    this.lastModifiedByUserId = labeledThingGroupDocument.lastModifiedByUserId;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {type, lineColor, groupIds, createdByUserId, lastModifiedByUserId} = this;
    return Object.assign(super.toJSON(), {
      identifierName: type,
      lineColor: lineColor,
      groupIds: clone(groupIds),
      createdByUserId,
      lastModifiedByUserId,
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
      // Remapping of type => identifierName
      identifierName: this.type,
      lineColor: this.lineColor,
      groupIds: this.groupIds,
      createdByUserId: this.createdByUserId,
      lastModifiedByUserId: this.lastModifiedByUserId,
    });
  }
}

export default LabeledThingGroup;
