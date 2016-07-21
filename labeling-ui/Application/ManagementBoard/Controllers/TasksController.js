/**
 * Controller for the initial entrypoint route into the application
 */
class TasksController {
  /**
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   * @param {TaskGateway} taskGateway
   */
  constructor($stateParams, user, userPermissions, taskGateway) {
    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {UserPermissions}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {string}
     */
    this.projectId = $stateParams.projectId;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {Object|null}
     */
    this.taskCount = null;

    this._loadTaskCount(this.projectId);
  }

  /**
   * @param {string} projectId
   * @private
   */
  _loadTaskCount(projectId) {
    // @TODO: load task count here!
  }
}

TasksController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
  'taskGateway',
];

export default TasksController;
