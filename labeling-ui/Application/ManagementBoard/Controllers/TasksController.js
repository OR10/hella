/**
 * Controller for the initial entrypoint route into the application
 */
class TasksController {
  /**
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {UserPermissions} userPermissions
   */
  constructor($stateParams, user, userPermissions) {
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
  }
}

TasksController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
];

export default TasksController;
