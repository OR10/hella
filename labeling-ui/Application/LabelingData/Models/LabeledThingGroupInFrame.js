import {clone} from 'lodash';
import LabeledObject from './LabeledObject';

class LabeledThingGroupInFrame extends LabeledObject {
  /**
   * @param {Object} labeledThingGroupInFrame
   */
  constructor(labeledThingGroupInFrame) {
    // Extract task from labeledThingGroup and propagate it up the chain
    super(
      Object.assign({}, labeledThingGroupInFrame, {task: labeledThingGroupInFrame.labeledThingGroup.task})
    );

    /**
     * @type {string}
     */
    this.id = labeledThingGroupInFrame.id;

    /**
     * @type {int}
     */
    this.frameIndex = labeledThingGroupInFrame.frameIndex;

    /**
     * @type {Array.<string>}
     */
    this.classes = clone(labeledThingGroupInFrame.classes);

    /**
     * @type {LabeledThingGroup}
     */
    this.labeledThingGroup = labeledThingGroupInFrame.labeledThingGroup;
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
