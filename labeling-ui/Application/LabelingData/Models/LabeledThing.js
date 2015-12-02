import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThing
 *
 * @extends LabeledObject
 */
class LabeledThing extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, task: Task, frameRange: FrameRange}} labeledThing
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
  }

  /**
   * {@link Task} associated with this `LabeledThing`
   *
   * @returns {Task}
   */
  get task() {
    return this._task;
  }
}

export default LabeledThing;
