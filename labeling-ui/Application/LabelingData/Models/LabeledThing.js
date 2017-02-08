import cloneDeep from 'lodash.clonedeep';
import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThing
 *
 * @extends LabeledObject
 */
class LabeledThing extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, task: Task, frameRange: FrameRange, lineColor: string, projectId: string}} labeledThing
   */
  constructor(labeledThing) {
    super(labeledThing);

    /**
     * {@link FrameRange} this `LabeledThing` is defined in
     *
     * @type {FrameRange}
     */
    this.frameRange = cloneDeep(labeledThing.frameRange);

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

    /**
     * @type {string}
     * @private
     */
    this._projectId = labeledThing.projectId;

    /**
     * @type {Array.<string>}
     */
    this.groupIds = labeledThing.groupIds || [];
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
   * @returns {string}
   */
  get projectId() {
    return this._projectId;
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameRange, lineColor, task, projectId, groupIds} = this;
    return Object.assign(super.toJSON(), {
      lineColor,
      projectId,
      groupIds,
      frameRange: cloneDeep(frameRange),
      taskId: task.id,
    });
  }
}

export default LabeledThing;
