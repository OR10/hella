import merge from 'lodash.merge';

/**
 * Controller for the initial entrypoint route into the application
 */
class TasksController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$stateParams} $stateParams
   * @param {User} user
   * @param {Object} userPermissions
   * @param {TaskGateway} taskGateway
   */
  constructor($scope, $stateParams, user, userPermissions, taskGateway) {
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

    this._$scope.$on('task-list:dependant-tasks-changed', () => {
      this._$scope.$broadcast('task-list:reload-requested');
    });
  }

  /**
   * @param {string} projectId
   * @private
   */
  _loadTaskCount(projectId) {
    this._taskGateway.getTaskCount(projectId).then(taskCount => {
      const defaultedTaskCount = merge({}, {
        labeling: {
          todo: 0,
          in_progress: 0,
          done: 0,
          processing: 0,
        },
        review: {
          todo: 0,
          in_progress: 0,
          done: 0,
        },
        revision: {
          todo: 0,
          in_progress: 0,
          done: 0,
        },
      }, taskCount);

      Object.keys(defaultedTaskCount).forEach(
        type => defaultedTaskCount[type].overall = Object.keys(defaultedTaskCount[type]).reduce(
          (sum, status) => sum + defaultedTaskCount[type][status],
          0
        )
      );

      this.taskCount = defaultedTaskCount;
    });
  }
}

TasksController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
  'taskGateway',
];

export default TasksController;
