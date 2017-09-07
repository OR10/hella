import {clone} from 'lodash';
import moment from 'moment';

/**
 * Base model for any object, which has labels
 */
class LabeledObject {
  /**
   * @param {{id: string, classes: *, incomplete: boolean, task: Task, createdAt: string, lastModifiedAt: string}} labeledObject
   */
  constructor(labeledObject) {
    // Required properties
    /**
     * Unique identifier of the labeledObject
     *
     * @type {string}
     */
    this.id = labeledObject.id;

    /**
     * {@link Task} associated with this `labeledObject`
     *
     * @type {Task}
     * @private
     */
    this._task = labeledObject.task;

    /**
     * Id of the project associated with this `LabeledObject`
     *
     * @type {string}
     * @private
     */
    this._projectId = labeledObject.task.projectId;

    /**
     * The labels assigned to this `labeledObject`
     *
     * @type {Array.<String>}
     */
    this.classes = clone(labeledObject.classes);

    /**
     * Incomplete state of this `LabeledObject`
     *
     * A `LabeledObject` is flagged as being complete as soon, as all required labels are set and for example a shape
     * is available. Being complete indicates the labeling process for this `LabeledObject` is finished.
     *
     * @type {boolean}
     */
    this.incomplete = labeledObject.incomplete;

    /**
     *
     * @type {string}
     */
    this.createdAt = labeledObject.createdAt;

    /**
     *
     * @type {string}
     */
    this.lastModifiedAt = labeledObject.lastModifiedAt;
  }

  /**
   * {@link Task} associated with this `LabeledObject`
   *
   * @returns {Task}
   */
  get task() {
    return this._task;
  }

  /**
   * Id of the project associated with this `LabeledObject`
   *
   * @returns {string}
   */
  get projectId() {
    return this._projectId;
  }

  /**
   * Store a new set of labels.
   *
   * The setter ensures that a unique set of labels is stored
   *
   * @param {Array.<string>} newClasses
   */
  setClasses(newClasses) {
    // Ensure all stored classes are a unique list
    this.classes = [...new Set(newClasses)];
  }

  /**
   * Add a new label to the currently stored list of labels
   *
   * It is ensured, that the label list stays unique
   *
   * @param {string} newClass
   */
  addClass(newClass) {
    this.setClasses([...this.classes, newClass]);
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    if (this.createdAt === undefined) {
      this.createdAt = this._getCurrentDate();
    }
    this.lastModifiedAt = this._getCurrentDate();
    const {id, task, projectId, classes, incomplete, createdAt, lastModifiedAt} = this;
    return {
      id,
      incomplete,
      projectId,
      taskId: task.id,
      classes: clone(classes),
      createdAt,
      lastModifiedAt,
    };
  }

  /**
   * @protected
   * @returns {string}
   */
  _getCurrentDate() {
    return moment().format('YYYY-MM-DD HH:mm:ss.000000');
  }

  /**
   * Extract the classList
   *
   * @returns {Array.<object>}
   * @private
   */
  extractClassList() {
    if (this.ghostClasses !== null) {
      return this.ghostClasses;
    }

    return this.classes;
  }

  /**
   * @return {LabeledObject}
   */
  clone() {
    return new LabeledObject(this);
  }
}

export default LabeledObject;
