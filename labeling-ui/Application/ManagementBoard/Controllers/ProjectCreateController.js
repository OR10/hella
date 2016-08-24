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
   */
  constructor($scope, $state, user, userPermissions, projectGateway, taskConfigurationGateway) {
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
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {null}
     */
    this.name = null;

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
     * @type {Array.<Object>}
     */
    this.taskTypes = [
      {id: 'vehicle', name: 'Vehicle'},
      {id: 'parked-cars', name: 'Parked Cars'},
      {id: 'person', name: 'Person'},
      {id: 'cyclist', name: 'Cyclist'},
      {id: 'ignore', name: 'Ignore'},
      {id: 'ignore-vehicle', name: 'Ignore Vehicle'},
      {id: 'lane', name: 'Lane'},
    ];

    /**
     * @type {string}
     */
    this.taskTypeToAdd = '';

    /**
     * @type {Array.<Object>}
     */
    this.taskConfigurations = [];

    /**
     * @type {string}
     */
    this.taskConfigToAdd = '';

    /**
     * @type {Array}
     */
    this.labelingTaskTypes = [];

    this._taskConfigurationGateway.getConfigurations().then(configurations => {
      this.taskConfigurations = configurations;
    });
  }

  /**
   * @param taskTypeToAdd
   * @param taskConfigToAdd
   */
  addTaskType(taskTypeToAdd, taskConfigToAdd) {
    const type = this.taskTypes.find(item => item.id === taskTypeToAdd);
    const config = this.taskConfigurations.find(item => item.id === taskConfigToAdd);
    if (!type || !config) {
      return;
    }

    this.labelingTaskTypes.push({config, type});
    this.taskTypes = this.taskTypes.filter(item => {
      return item.id !== taskTypeToAdd;
    });

    this.taskTypeToAdd = '';
    this.taskConfigToAdd = '';
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
    this.loadingInProgress = true;

    const taskTypeConfigurations = this.labelingTaskTypes.map(taskType => {
      return {
        type: taskType.type.id,
        taskConfigurationId: taskType.config.id,
      };
    });
    const data = {
      name: this.name,
      review: this.review,
      frameSkip: this.frameSkip,
      startFrameNumber: this.startFrameNumber,
      splitEach: this.splitEach,
      projectType: 'genericXml',
      taskTypeConfigurations,
    };

    this._projectGateway.createProject(data).then(() => {
      this.goBack();
    });
  }

  /**
   * Save a project with legacy export
   */
  saveLegacy() {
    this.loadingInProgress = true;

    const data = {
      name: this.name,
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

    this._projectGateway.createProject(data).then(() => {
      this.goBack();
    });
  }

  /**
   * Go back to the project list
   */
  goBack() {
    this._$state.go('labeling.projects.list');
  }

}

ProjectCreateController.$inject = [
  '$scope',
  '$state',
  'user',
  'userPermissions',
  'projectGateway',
  'taskConfigurationGateway',
];

export default ProjectCreateController;
