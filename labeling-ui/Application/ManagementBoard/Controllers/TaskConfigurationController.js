/**
 * Controller to handle TaskConfigurations CRUD
 */
class TaskConfigurationController {
  /**
   * @param {User} user
   * @param {Object} userPermissions
   * @param {TaskConfigurationGateway} taskConfigurationGateway
   */
  constructor(user, userPermissions, taskConfigurationGateway) {
    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {TaskConfigurationGateway}
     * @private
     */
    this._taskConfigurationGateway = taskConfigurationGateway;
  }
}

TaskConfigurationController.$inject = [
  'user',
  'userPermissions',
  'taskConfigurationGateway',
];

export default TaskConfigurationController;
