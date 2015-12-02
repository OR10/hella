import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThing
 *
 * @extends LabeledObject
 */
class LabeledThing extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, taskId: string, frameRange: FrameRange}} labeledThing
   */
  constructor(labeledThing) {
    super(labeledThing);

    /**
     * Unique identifier of the {@link Task} associated with this `LabeledFrame`
     *
     * @type {string}
     */
    this.taskId = labeledThing.taskId;

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
    this._task = null;
  }

  /**
   * {@link Task} associated with this `LabeledThing`
   *
   * @returns {Task}
   */
  get task() {
    if (this._task === null) {
      throw new Error('Task has been read before the dependency was injected.');
    }

    return this._task;
  }

  /**
   * {@link Task} associated with this `LabeledThing`
   *
   * @param {Task} value
   */
  set task(value) {
    if (this._task !== null) {
      throw new Error('Tried to inject Task dependency for a second time.');
    }

    this._task = value;
  }
}

export default LabeledThing;
