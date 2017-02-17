import {merge} from 'lodash';

/**
 * Controller for the initial entrypoint route into the application
 */
class TasksController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Object} project
   * @param {TaskGateway} taskGateway
   */
  constructor($scope, $stateParams, user, userPermissions, project, taskGateway) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.project = project;

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

    this.showReviewTab = project.labelingValidationProcesses.indexOf('review') !== -1;

    this._loadTaskCount(this.projectId);

    this._$scope.$on('task-list:dependant-tasks-changed', () => {
      this._$scope.$broadcast('task-list:reload-requested');
      this._loadTaskCount(this.projectId);
    });
  }

  /**
   * @param {string} projectId
   * @private
   */
  _loadTaskCount(projectId) {
    this._taskGateway.getTaskCount(projectId).then(taskCount => {
      const phases = [
        'labeling',
        'review',
        'revision',
      ];

      const states = [
        'waiting_for_precondition',
        'preprocessing',
        'todo',
        'in_progress',
        'done',
      ];

      const statesForOverallCalculation = [
        'todo',
        'in_progress',
        'done',
      ];

      const defaults = {};
      phases.forEach(phase => {
        defaults[phase] = {};
        states.forEach(status => defaults[phase][status] = 0);
      });

      const defaultedTaskCount = merge({}, defaults, taskCount);
      delete defaultedTaskCount.all_phases_done;

      Object.keys(defaultedTaskCount).forEach(
        type => defaultedTaskCount[type].overall = statesForOverallCalculation.reduce(
          (sum, status) => sum + defaultedTaskCount[type][status],
          0
        )
      );
      defaultedTaskCount.all_phases_done = taskCount.all_phases_done;

      this.taskCount = defaultedTaskCount;
    });
  }
}

TasksController.$inject = [
  '$scope',
  '$stateParams',
  'user',
  'userPermissions',
  'project',
  'taskGateway',
];

export default TasksController;
