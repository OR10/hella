import {cloneDeep, reduce} from 'lodash';

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
     * @type {string|null}
     */
    this.videoId = null;

    // @HACK: The backend provides to different task models while presenting a single task or presenting a list of tasks
    //        The list does proivde a full video object, while the single task only provides a videoId.
    // @TODO: The list should only provide the needed (listed) information and a special version of the model, while the full
    //        task should provide either an embedded video or a videoId. (Backend work)
    if (task.video !== undefined && task.videoId === undefined) {
      this.videoId = task.video.id;
    } else if (task.videoId !== undefined) {
      this.videoId = task.videoId;
    }

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
     * Reopened information splitted by phase
     *
     * @type {Object.<string, boolean>}
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

    /**
     * @type {Boolean}
     */
    this.taskAttentionFlag = task.taskAttentionFlag;

    /**
     * @type {string}
     */
    this.taskConfigurationId = task.taskConfigurationId;
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
   * Returns ths phase the task is currently in
   *
   * @returns {string}
   */
  getPhase() {
    const allDone = reduce(
      this.status,
      (last, current) => {
        return last && current === 'done';
      },
      true
    );

    if (allDone) {
      return 'all_phases_done';
    }

    let phase;
    Object.keys(this.status).forEach(statusName=> {
      if (this.status[statusName] === 'todo' || this.status[statusName] === 'in_progress') {
        phase = statusName;
      }
    });

    if (phase !== undefined) {
      return phase;
    }

    throw new Error('Failed to determine the tasks phase');
  }

  /**
   * Checks if this tasks is currently assigned to the provided user
   *
   * @param {User }user
   * @returns {boolean}
   */
  isUsersTask(user) {
    const assignedUser = this.getLatestAssignedUserForPhase(this.getPhase());

    if (assignedUser && assignedUser.id === user.id) {
      return true;
    }

    return false;
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
   * @param {string} userId
   * @param {string} status
   */
  hasUserInStatus(userId, status) {
    return this.assignmentHistory
        .filter(entry => (entry.userId === userId && entry.status === status))
        .length !== 0;
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

  /**
   * Checks if the given user is allowed to be assigned to the task under the current pretence
   *
   * @param {User} user
   * @returns {boolean}
   */
  isUserAllowedToBeAssigned(user) {
    const activePhase = this.getPhase();
    const activeAssignedUser = this.getLatestAssignedUserForPhase(activePhase);

    // No assignment in current phase, means the user might assign himself
    if (activeAssignedUser === null) {
      return true;
    }

    // Reassignment of the same user is allowed.
    if (activeAssignedUser.id === user.id) {
      return true;
    }

    // Every not specifically allowed request is denied.
    return false;
  }

  toJSON() {
    const {
      id,
      video,
      videoId,
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
      reopen: cloneDeep(reopen),
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
      taskType,
      videoId,
    };
  }
}

export default Task;
