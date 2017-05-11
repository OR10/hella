import LabeledObject from './LabeledObject';
import {clone} from 'lodash';

/**
 * Model for a LabeledFrame
 *
 * @extends LabeledObject
 */
class LabeledFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, taskId: string, frameIndex: int}} labeledFrame
   */
  constructor(labeledFrame) {
    super(labeledFrame);

    /**
     * {@link Task} associated with this `LabeledFrame`
     *
     * @type {string}
     */
    this.task = labeledFrame.task;

    /**
     * Frame number this label information belongs to inside the associated {@link Task}
     *
     * @type {Number}
     */
    this.frameIndex = labeledFrame.frameIndex;

    /**
     * The ghost labels inherited from earlier labels
     *
     * @type {Array.<String>|null}
     */
    this.ghostClasses = clone(labeledFrame.ghostClasses);
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
   * @return {Array.<String>}
   */
  extractClassList() {
    return this.classes;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {task, frameIndex, ghostClasses} = this;

    return Object.assign(super.toJSON(), {
      frameIndex,
      taskId: task.id,
      ghostClasses: clone(ghostClasses),
    });
  }
}

export default LabeledFrame;
