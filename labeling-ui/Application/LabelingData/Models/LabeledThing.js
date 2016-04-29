import clone from 'lodash.clone';
import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThing
 *
 * @extends LabeledObject
 */
class LabeledThing extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, task: Task, frameRange: FrameRange, lineColor: string}} labeledThing
   */
  constructor(labeledThing) {
    super(labeledThing);

    /**
     * {@link FrameRange} this `LabeledThing` is defined in
     *
     * @type {FrameRange}
     */
    this.frameRange = labeledThing.frameRange;

    /**
     * @type {Task}
     * @private
     */
    this._task = labeledThing.task;

    /**
     * @type {String}
     * @private
     */
    this._lineColor = labeledThing.lineColor;
  }

  /**
   * {@link Task} associated with this `LabeledThing`
   *
   * @returns {Task}
   */
  get task() {
    return this._task;
  }

  /**
   * @returns {String}
   */
  get lineColor() {
    return this._lineColor;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameRange, lineColor, task} = this;
    return Object.assign(super.toJSON(), {
      lineColor,
      frameRange: clone(frameRange),
      taskId: task.id,
    });
  }
}

export default LabeledThing;
