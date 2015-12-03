import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledFrame
 *
 * @extends LabeledObject
 */
class LabeledFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, taskId: string, frameNumber: int}} labeledFrame
   */
  constructor(labeledFrame) {
    super(labeledFrame);

    // Required properties
    /**
     * Unique identifier of the {@link Task} associated with this `LabeledFrame`
     *
     * @type {string}
     */
    this.taskId = labeledFrame.taskId;

    /**
     * Frame number this label information belongs to inside the associated {@link Task}
     *
     * @type {Number}
     */
    this.frameNumber = labeledFrame.frameNumber;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {taskId, frameNumber} = this;
    return Object.assign(super.toJSON(), {
      taskId, frameNumber,
    });
  }
}

export default LabeledFrame;
