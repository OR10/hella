import moment from 'moment';

/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectCreateController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {ProjectGateway} projectGateway
   * @param {TaskConfigurationGateway} taskConfigurationGateway
   * @param {ModalService} modalService
   * @param {OrganisationService} organisationService
   * @param {EntityIdService} entityIdService
   */
  constructor($scope, $state, user, userPermissions, projectGateway, taskConfigurationGateway, modalService, organisationService, entityIdService) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {$state}
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
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

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
     * @type {string}
     */
    this.currentOrganisationId = organisationService.get();

    /**
     * @type {integer}
     */
    this.loadingInProgress = 0;

    /**
     * @type {null}
     */
    this.name = null;

    /**
     * @type {null}
     */
    this.description = null;

    /**
     * @type {null}
     */
    this.dueDate = null;

    /**
     * @type {boolean}
     */
    this.review = true;

    /**
     * @type {number}
     */
    this.frameSkip = 22;

    /**
     * @type {number}
     */
    this.startFrameNumber = 22;

    /**
     * @type {number}
     */
    this.splitEach = 0;

    /**
     * @type {boolean}
     */
    this.vehicle = true;

    /**
     * @type {boolean}
     */
    this.ignoreVehicle = true;

    /**
     * @type {boolean}
     */
    this.lane = true;

    /**
     * @type {boolean}
     */
    this.person = false;

    /**
     * @type {boolean}
     */
    this.cyclist = false;

    /**
     * @type {boolean}
     */
    this.parkedCars = false;

    /**
     * @type {boolean}
     */
    this.ignore = false;

    /**
     * @type {string}
     */
    this.drawingToolVehicle = 'cuboid';

    /**
     * @type {string}
     */
    this.selectedCampaign = '';

    /**
     * @type {string}
     */
    this.drawingToolIgnoreVehicle = 'rectangle';

    /**
     * @type {string}
     */
    this.drawingToolLane = 'rectangle';

    /**
     * @type {string}
     */
    this.drawingToolPerson = 'pedestrian';

    /**
     * @type {string}
     */
    this.drawingToolCyclist = 'rectangle';

    /**
     * @type {string}
     */
    this.drawingToolIgnore = 'rectangle';

    /**
     * @type {string}
     */
    this.drawingToolParkedCars = 'cuboid';

    /**
     * @type {string}
     */
    this.uploadUuid = entityIdService.getUniqueId();

    /**
     * @type {Array.<Object>}
     */
    this.taskTypes = [
      {id: 'vehicle', name: 'Vehicle'},
      // {id: 'parked-cars', name: 'Parked Cars'},
      {id: 'person', name: 'Person'},
      {id: 'cyclist', name: 'Cyclist'},
      {id: 'ignore', name: 'Ignore'},
      {id: 'miscellaneous', name: 'Miscellaneous'},
      // {id: 'ignore-vehicle', name: 'Ignore Vehicle'},
      // {id: 'lane', name: 'Lane'},
    ];

    /**
     * TODO: Fill this later with real world data
     *
     * @type {Array.<Object>}
     */
    this.campaigns = [
      {id: 4711, name: 'Test'},
    ];

    /**
     * @type {string}
     */
    this.taskTypeToAdd = '';

    /**
     * @type {Array.<Object>}
     */
    this.requirementsXmlTaskConfigurations = [];

    /**
     * @type {string}
     */
    this.taskConfigToAdd = '';

    /**
     * @type {{username: boolean, frameSkip: boolean, startFrameNumber: boolean, splitEach: boolean}}
     */
    this.validation = {
      name: true,
      frameSkip: true,
      startFrameNumber: true,
      splitEach: true,
      dueDate: true,
      requirementsTaskType: true,
      requirementsTaskConfig: true,
    };

    /**
     * @type {Array}
     */
    this.labelingTaskTypes = [];

    this._taskConfigurationGateway.getRequirementsXmlConfigurations().then(configurations => {
      this.requirementsXmlTaskConfigurations = configurations;
    });
  }

  /**
   * @param type
   */
  removeType(type) {
    this.taskTypes.push(type.type);
    this.labelingTaskTypes = this.labelingTaskTypes.filter(taskType => taskType.type.id !== type.type.id);
  }

  /**
   * Save a project with genericXml export
   */
  saveGeneric() {
    if (!this._validateProjectNameAndSettings()) {
      return;
    }
    ++this.loadingInProgress;

    const taskTypeConfigurations = this.labelingTaskTypes.map(taskType => {
      return {
        type: taskType.type.id,
        taskConfigurationId: taskType.config.id,
      };
    });
    const data = {
      name: this.name,
      description: this.description,
      review: this.review,
      frameSkip: this.frameSkip,
      startFrameNumber: this.startFrameNumber,
      splitEach: this.splitEach,
      projectType: 'genericXml',
      taskTypeConfigurations,
    };

    this._projectGateway.createProject(data)
      .then(() => {
        --this.loadingInProgress;
        this.goBack();
      })
      .catch(error => {
        --this.loadingInProgress;
        this._handleCreationError(error);
      });
  }

  /**
   * Save a project with genericXml export
   */
  saveRequirementsXml() {
    this.validation.requirementsTaskConfig = true;
    this.validation.requirementsTaskType = true;
    if (this.taskConfigToAdd === '') {
      this.validation.requirementsTaskConfig = false;
    }
    if (this.taskTypeToAdd === '') {
      this.validation.requirementsTaskType = false;
    }

    if (!this._validateProjectNameAndSettings() || !this.validation.requirementsTaskType || !this.validation.requirementsTaskConfig) {
      return;
    }
    ++this.loadingInProgress;

    const taskTypeConfigurations = [
      {
        type: this.taskTypeToAdd,
        taskConfigurationId: this.taskConfigToAdd,
      },
    ];
    const data = {
      name: this.name,
      description: this.description,
      review: this.review,
      frameSkip: this.frameSkip,
      startFrameNumber: this.startFrameNumber,
      splitEach: this.splitEach,
      projectType: 'requirementsXml',
      taskTypeConfigurations,
      dueDate: this.dueDate === null ? null : moment(this.dueDate).format('YYYY-MM-DD H:mm:ss.SSSSSS'),
    };

    this._projectGateway.createProject(data)
      .then(() => {
        --this.loadingInProgress;
        this.taskTypeToAdd = '';
        this.taskConfigToAdd = '';
        this.goBack();
      })
      .catch(error => {
        --this.loadingInProgress;
        this._handleCreationError(error);
      });
  }

  _handleCreationError(error) {
    this._modalService.info(
      {
        title: 'Error creating project',
        headline: `The project could not be created.`,
        message: error.data.error.message,
        confirmButtonText: 'Understood',
      },
      undefined,
      undefined,
      {
        warning: true,
        abortable: false,
      }
    );
  }

  /**
   * Save a project with legacy export
   */
  saveLegacy() {
    if (!this._validateProjectNameAndSettings()) {
      return;
    }
    ++this.loadingInProgress;

    const data = {
      name: this.name,
      description: this.description,
      review: this.review,
      frameSkip: this.frameSkip,
      startFrameNumber: this.startFrameNumber,
      splitEach: this.splitEach,
      projectType: 'legacy',
      vehicle: this.vehicle,
      drawingToolVehicle: this.drawingToolVehicle,
      person: this.person,
      drawingToolPerson: this.drawingToolPerson,
      cyclist: this.cyclist,
      drawingToolCyclist: this.drawingToolCyclist,
      ignore: this.ignore,
      drawingToolIgnore: this.drawingToolIgnore,
      'ignore-vehicle': this.ignoreVehicle,
      drawingToolIgnoreVehicle: this.drawingToolIgnoreVehicle,
      lane: this.lane,
      drawingToolLane: this.drawingToolLane,
      'parked-cars': this.parkedCars,
      drawingToolParkedCars: this.drawingToolParkedCars,
    };

    this._projectGateway.createProject(data)
      .then(() => {
        --this.loadingInProgress;
        this.goBack();
      })
      .catch(error => {
        --this.loadingInProgress;
        this._handleCreationError(error);
      });
  }

  /**
   * Go back to the project list
   */
  goBack() {
    this._$state.go('labeling.projects.list');
  }

  /**
   * Each upload got its own identifier
   *
   * @returns {string}
   */
  getUuid() {
    return this.uploadUuid;
  }

  /**
   * Validates the user
   *
   * @private
   */
  _validateProjectNameAndSettings() {
    let valid = true;

    this.validation.name = true;
    this.validation.frameSkip = true;
    this.validation.startFrameNumber = true;
    this.validation.splitEach = true;
    this.validation.dueDate = true;

    if (this.name === null || this.name === '') {
      this.validation.name = valid = false;
    }

    if (this.frameSkip === undefined) {
      this.validation.frameSkip = valid = false;
    }

    if (this.startFrameNumber === undefined) {
      this.validation.startFrameNumber = valid = false;
    }

    if (this.splitEach === undefined) {
      this.validation.splitEach = valid = false;
    }

    if (this.dueDate === undefined) {
      this.validation.dueDate = valid = false;
    }

    if (moment(this.dueDate).toDate() < moment().toDate()) {
      this.validation.dueDate = valid = false;
    }

    return valid;
  }
}

ProjectCreateController.$inject = [
  '$scope',
  '$state',
  'user',
  'userPermissions',
  'projectGateway',
  'taskConfigurationGateway',
  'modalService',
  'organisationService',
  'EntityIdService',
];

export default ProjectCreateController;
