import {clone} from 'lodash';
import LabeledObject from './LabeledObject';

class LabeledThingGroupInFrame extends LabeledObject {
  /**
   * @param {Object} labeledThingGroupInFrameDocument
   */
  constructor(labeledThingGroupInFrameDocument) {
    super(labeledThingGroupInFrameDocument);

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
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameIndex, classes, labeledThingGroup} = this;
    return Object.assign(super.toJSON(), {
      frameIndex: frameIndex,
      classes: clone(classes),
      labeledThingGroupId: labeledThingGroup.id,
    });
  }

  /**
   * @return {LabeledThingGroupInFrame}
   */
  clone() {
    return new LabeledThingGroupInFrame(this);
  }
}

export default LabeledThingGroupInFrame;
