/**
 * Controller to handle TaskConfigurations Uploads
 */
class TaskConfigurationManagementController {
  /**
   * @param {angular.$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {TaskConfigurationGateway} taskConfigurationGateway
   * @param {ModalService} modalService
   * @param {ListDialog} ListDialog
   * @param {OrganisationService} organisationService
   * @param {ApiService} ApiService
   */
  constructor($state, user, userPermissions, taskConfigurationGateway, modalService, ListDialog, organisationService, ApiService) {
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
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ListDialog}
     * @private
     */
    this._ListDialog = ListDialog;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this._apiService = ApiService;

    /**
     * @type {string}
     */
    this.taskConfigurationName = '';

    /**
     * @type {null|File}
     */
    this.taskConfigurationFile = null;

    /**
     * @type {string}
     */
    this.requirementsConfigurationName = '';

    /**
     * @type {null|File}
     */
    this.requirementsConfigurationFile = null;

    /**
     * @type {number}
     */
    this.loadingInProgress = 0;

    /**
     * @type {{file: boolean, name: boolean}}
     */
    this.taskConfigurationValidation = {
      file: true,
      name: true,
    };

    /**
     * @type {{file: boolean, name: boolean}}
     */
    this.requirementsConfigurationValidation = {
      file: true,
      name: true,
    };

    /**
     * @type {Array}
     */
    this.requirementTaskConfigurations = [];

    this.getUploadedRequirementsConfigurations();
  }

  uploadRequirementsConfiguration() {
    if (!this._validateRequirementsConfiguration()) {
      return;
    }

    ++this.loadingInProgress;
    this._taskConfigurationGateway.uploadRequirementsConfiguration(this.requirementsConfigurationName, this.requirementsConfigurationFile)
      .then(() => {
        --this.loadingInProgress;
        this._$state.go('labeling.projects.list');
      })
      .catch(error => {
        --this.loadingInProgress;
        let headline = null;
        switch (error.code) {
          case 406:
            headline = 'Malformed XML Configuration.';
            break;
          case 409:
            headline = 'Duplicate configuration.';
            break;
          default:
            headline = 'XML Task Configuration Upload failed.';
        }
        this._modalService.info(
          {
            title: 'Error uploading Requirements Configuration',
            headline,
            message: error.message,
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
      });
  }

  getUploadedRequirementsConfigurations() {
    ++this.loadingInProgress;
    this._taskConfigurationGateway.getRequirementsXmlConfigurations()
      .then(response => {
        this.requirementTaskConfigurations = response;
        --this.loadingInProgress;
      });
  }

  /**
   * @param configurationId
   * @returns {string}
   */
  getDownloadUrl(configurationId) {
    const organisationId = this._organisationService.get();

    return this._apiService.getApiUrl(
      `/organisation/${organisationId}/taskConfiguration/${configurationId}/file`
    );
  }

  displayUsedProjectsModal(projects) {
    this._modalService.show(
      new this._ListDialog(
        {
          title: 'Task configuration usage',
          headline: 'Projects using this task configuration',
          message: undefined,
          confirmButtonText: 'Understood',
          data: projects.map(project => {
            return project.name;
          }),
        },
        undefined,
        undefined,
        {
          abortable: false,
        }
      )
    );
  }

  uploadTaskConfiguration() {
    if (!this._validateTaskConfiguration()) {
      return;
    }

    ++this.loadingInProgress;
    this._taskConfigurationGateway.uploadTaskConfiguration(this.taskConfigurationName, this.taskConfigurationFile)
      .then(() => {
        --this.loadingInProgress;
        this._$state.go('labeling.projects.list');
      })
      .catch(error => {
        --this.loadingInProgress;
        let headline = null;
        switch (error.code) {
          case 406:
            headline = 'Malformed XML Configuration.';
            break;
          case 409:
            headline = 'Duplicate configuration.';
            break;
          default:
            headline = 'XML Task Configuration Upload failed.';
        }
        this._modalService.info(
          {
            title: 'Error uploading Task Configuration',
            headline,
            message: error.message,
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
      });
  }

  _validateTaskConfiguration() {
    this.taskConfigurationValidation.file = this.taskConfigurationFile !== null;
    this.taskConfigurationValidation.name = this.taskConfigurationName !== '';

    return Object.keys(this.taskConfigurationValidation)
      .reduce((valid, key) => valid && this.taskConfigurationValidation[key], true);
  }

  _validateRequirementsConfiguration() {
    this.requirementsConfigurationValidation.file = this.requirementsConfigurationFile !== null;
    this.requirementsConfigurationValidation.name = this.requirementsConfigurationName !== '';

    return Object.keys(this.requirementsConfigurationValidation)
      .reduce((valid, key) => valid && this.requirementsConfigurationValidation[key], true);
  }
}

TaskConfigurationManagementController.$inject = [
  '$state',
  'user',
  'userPermissions',
  'taskConfigurationGateway',
  'modalService',
  'ListDialog',
  'organisationService',
  'ApiService',
];

export default TaskConfigurationManagementController;
