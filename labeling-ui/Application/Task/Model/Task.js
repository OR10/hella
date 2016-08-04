import cloneDeep from 'lodash.clonedeep';

/**
 * Primary Task model
 *
 * A Task can be considered to be a labeling job. It contains all the needed information to have any user work on it.
 *
 */
class Task {
  /**
   * @param {Object} task
   * @param {Object.<string, User>} users
   */
  constructor(task, users = {}) {
    /**
     * @type {string}
     */
    this.id = task.id;

    /**
     * @type {Object}
     */
    this.video = task.video;

    /**
     * @type {string}
     */
    this.createdAt = task.createdAt;

    /**
     * @type {string}
     */
    this.descriptionText = task.descriptionText;

    /**
     * @type {string}
     */
    this.descriptionTitle = task.descriptionTitle;

    /**
     * @type {string}
     */
    this.drawingTool = task.drawingTool;

    /**
     * @type {Object}
     */
    this.drawingToolOptions = task.drawingToolOptions;

    /**
     * @type {Array.<number>}
     */
    this.frameNumberMapping = task.frameNumberMapping;

    /**
     * @type {boolean}
     */
    this.hideAttributeSelector = task.hideAttributeSelector;

    /**
     * @type {string}
     */
    this.labelInstruction = task.labelInstruction;

    /**
     * @type {Object}
     */
    this.labelStructure = task.labelStructure;

    /**
     * @type {Object}
     */
    this.labelStructureUi = task.labelStructureUi;

    /**
     * @type {Object}
     */
    this.metaData = task.metaData;

    /**
     * @type {number}
     */
    this.minimalVisibleShapeOverflow = task.minimalVisibleShapeOverflow;

    /**
     * @type {Array.<string>}
     */
    this.predefinedClasses = task.predefinedClasses;

    /**
     * @type {string}
     */
    this.projectId = task.projectId;

    /**
     * @type {boolean}
     */
    this.readOnly = task.readOnly;

    /**
     * @type {boolean}
     */
    this.reopen = task.reopen;

    /**
     * @type {Array.<string>}
     */
    this.requiredImageTypes = task.requiredImageTypes;

    /**
     * @type {Object}
     */
    this.status = task.status;

    /**
     * @type {string}
     */
    this.taskType = task.taskType;

    /**
     * @type {Array.<Object>}
     */
    this.assignmentHistory = task.assignmentHistory;

    /**
     * UserId to userobject mapping provided by the backend
     *
     * @type {Object}
     * @private
     */
    this._users = users;
  }

  /**
   * @param {string} phase
   * @returns {Object}
   */
  getLatestAssignmentForPhase(phase) {
    // This should not happen. Should be fixed in the backend!
    if (this.assignmentHistory === null) {
      return null;
    }

    const assignmentsForPhase = this.assignmentHistory
      .filter(assignment => assignment.phase === phase);

    if (assignmentsForPhase.length === 0) {
      return null;
    }

    assignmentsForPhase.sort(
      (firstAssignment, secondAssignment) => {
        const firstAssignedAt = parseInt(firstAssignment.assignedAt, 10);
        const secondAssignedAt = parseInt(secondAssignment.assignedAt, 10);
        if (firstAssignedAt < secondAssignedAt) {
          return -1;
        } else if (firstAssignedAt === secondAssignedAt) {
          return 0;
        } else { // eslint-disable-line no-else-return
          return 1;
        }
      }
    );

    return assignmentsForPhase.pop();
  }

  /**
   * @param {string} userId
   * @returns {User|null}
   */
  lookupUserFromAssignment(userId) {
    if (this._users[userId] === undefined) {
      return null;
    }

    return this._users[userId];
  }

  /**
   * @param {string} phase
   * @returns {User|null}
   */
  getLatestAssignedUserForPhase(phase) {
    const latestAssignmentForPhase = this.getLatestAssignmentForPhase(phase);

    if (latestAssignmentForPhase === null) {
      return null;
    }

    return this.lookupUserFromAssignment(latestAssignmentForPhase.userId);
  }

  /**
   * @param {string} phase
   * @returns {string|null}
   */
  getStatusForPhase(phase) {
    if (this.status[phase] === undefined) {
      return null;
    }

    return this.status[phase];
  }

  /**
   *
   * @param {string} status
   * @returns {boolean}
   */
  hasStatusInAnyPhase(status) {
    return Object.keys(this.status).reduce(
      (hasStatus, key) => hasStatus || this.status[key] === status,
      false
    );
  }

  toJSON() {
    const {
      id,
      video,
      createdAt,
      descriptionText,
      descriptionTitle,
      drawingTool,
      drawingToolOptions,
      frameNumberMapping,
      hideAttributeSelector,
      labelInstruction,
      labelStructure,
      labelStructureUi,
      metaData,
      minimalVisibleShapeOverflow,
      predefinedClasses,
      projectId,
      readOnly,
      reopen,
      requiredImageTypes,
      status,
      taskType,
      assignmentHistory,
    } = this;

    return {
      drawingToolOptions: cloneDeep(drawingToolOptions),
      frameNumberMapping: cloneDeep(frameNumberMapping),
      labelStructure: cloneDeep(labelStructure),
      labelStructureUi: cloneDeep(labelStructureUi),
      metaData: cloneDeep(metaData),
      predefinedClasses: cloneDeep(predefinedClasses),
      requiredImageTypes: cloneDeep(requiredImageTypes),
      status: cloneDeep(status),
      assignmentHistory: cloneDeep(assignmentHistory),
      video: cloneDeep(video),
      id,
      createdAt,
      descriptionText,
      descriptionTitle,
      drawingTool,
      hideAttributeSelector,
      labelInstruction,
      minimalVisibleShapeOverflow,
      projectId,
      readOnly,
      reopen,
      taskType,
    };
  }
}

export default Task;
