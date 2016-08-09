/**
 * Controller to handle TaskConfigurations Uploads
 */
class TaskConfigurationUploadController {
  /**
   * @param {angular.$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {TaskConfigurationGateway} taskConfigurationGateway
   */
  constructor($state, user, userPermissions, taskConfigurationGateway) {
    /**
     * @type {angular.$state}
     * @private
     */
    this._$state = $state;

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

    /**
     * @type {string}
     */
    this.configurationName = '';

    /**
     * @type {null|File}
     */
    this.configurationFile = null;

    /**
     * @type {number}
     */
    this.loadingInProgress = 0;

    /**
     * @type {{file: boolean, name: boolean}}
     */
    this.validation = {
      file: true,
      name: true,
    };
  }

  uploadConfiguration() {
    if (!this._validate()) {
      return;
    }

    ++this.loadingInProgress;
    this._taskConfigurationGateway.uploadTaskConfiguration(this.configurationName, this.configurationFile)
      .then(() => {
        --this.loadingInProgress;
        this._$state.go('labeling.task-configuration.list');
      });
  }

  _validate() {
    this.validation.file = this.configurationFile !== null;
    this.validation.name = this.configurationName !== '';

    return Object.keys(this.validation)
      .reduce((valid, key) => valid && this.validation[key], true);
  }
}

TaskConfigurationUploadController.$inject = [
  '$state',
  'user',
  'userPermissions',
  'taskConfigurationGateway',
];

export default TaskConfigurationUploadController;
