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

    /**
     * The ghost labels inherited from earlier labels
     *
     * @type {Array.<String>|null}
     */
    this.ghostClasses = labeledFrame.ghostClasses;
  }

  /**
   * Store a new set of labels.
   *
   * The setter ensures that a unique set of labels is stored
   *
   * @param {Array.<string>} newClasses
   */
  setClasses(newClasses) {
    super.setClasses(newClasses);

    // Remove ghostClasses once real classes are set
    this.ghostClasses = null;
  }

  /**
   * Add a new label to the currently stored list of labels
   *
   * It is ensured, that the label list stays unique
   *
   * @param {string} newClass
   */
  addClass(newClass) {
    if (this.ghostClasses !== null) {
      this.setClasses(this.ghostClasses);
    }

    super.addClass(newClass);
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {taskId, frameNumber, ghostClasses} = this;
    return Object.assign(super.toJSON(), {
      taskId, frameNumber, ghostClasses
    });
  }
}

export default LabeledFrame;
