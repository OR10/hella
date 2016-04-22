/**
 * Controller of the {@link TaskListDirective}
 */
class TaskListController {
  /**
   * @param {TaskGateway} taskGateway injected
   */
  constructor($scope, $stateParams, $state, taskGateway, projectGateway) {
    /**
     * @type {$stateParams}
     * @private
     */
    this._$stateParams = $stateParams;

    /**
     * List of tasks rendered by the directive
     * @type {null|Array.<Task>}
     */
    this.tasks = null;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {TaskGateway}
     * @private
     */
    this._taskGateway = taskGateway;

    /**
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * @type {Array<Object>}
     */
    this.projectList = [{
      id: '',
      name: 'All projects',
    }];

    this.showOnlyReopenedTasks = false;
    this.showOnlyReviewedTasks = false;

    this.filterReopenTasks = this.filterReopenTasks.bind(this);
    this.filterReviewTasks = this.filterReviewTasks.bind(this);

    this.selectedProject = this._$stateParams.project;

    $scope.$watch('vm.selectedProject', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $state.go('labeling.tasks', {project: newValue});
      }
    });

    this._loadTaskList();
    this._loadProjectList();
  }

  /**
   * Load a list of {@link Project}s for the project filters.
   *
   * @private
   */
  _loadProjectList() {
    this._projectGateway.getProjects().then(projects => {
      this.projectList = this.projectList.concat(
        projects.map(project => {
          return {
            id: project.id,
            name: `${project.name} [${project.id}]`,
          };
        })
      );
    });
  }

  /**
   * Retrieve a fresh list of {@link Task} objects from the backend.
   *
   * Once the retrieval operation is finished the {@link TaskListController#tasks} will be automatically updated
   * to the new list.
   *
   * @private
   */
  _loadTaskList() {
    this.loadingInProgress = true;
    this._taskGateway.getTasksAndVideos()
      .then(({tasks, videos, users}) => {
        this.preprocessingTasks = null;
        this.waitingTasks = null;
        this.labeledTasks = null;

        if (tasks.preprocessing) {
          this.preprocessingTasks = tasks.preprocessing.map(task => {
            task.video = videos[task.videoId];
            return task;
          });
        }
        if (tasks.waiting) {
          this.waitingTasks = tasks.waiting.map(task => {
            task.video = videos[task.videoId];
            if (task.assignedUser !== null) {
              task.user = users.find((user) => {
                return user.id === task.assignedUser;
              });
            }
            return task;
          });
        }
        if (tasks.labeled) {
          this.labeledTasks = tasks.labeled.map(task => {
            task.video = videos[task.videoId];
            if (task.assignedUser !== null) {
              task.user = users.find((user) => {
                return user.id === task.assignedUser;
              });
            }
            return task;
          });
        }

        this.loadingInProgress = false;
      });
  }

  /**
   * Returns if the given {@link Task} has the reopened flag set
   * and if the 'show only reopened' flag is set.
   *
   * @param task
   * @returns {Boolean}
   */
  filterReopenTasks(task) {
    if (!this.showOnlyReopenedTasks) {
      return true;
    }

    return task.reopen;
  }

  /**
   * Returns if the given {@link Task} has the reopened flag set
   * and if the 'show only reviewed' flag is set.
   *
   * @param task
   * @returns {*}
   */
  filterReviewTasks(task) {
    if (!this.showOnlyReviewedTasks) {
      return true;
    }

    return task.reopen;
  }

  /**
   * Reopen a closed {@link Task}
   *
   * @param {Task} task
   */
  reOpenTask(task) {
    this.loadingInProgress = true;
    this._taskGateway.markTaskAsWaiting(task)
      .then(() => this._loadTaskList());
  }

  /**
   * Remove a certain `User` association from a {@link Task}
   * @param {Task} task
   * @param {string} user
   */
  removeAssignment(task, user) {
    this._taskGateway.dissociateUserFromTask(task, user).then(() => {
      task.assignedUser = null;
    });
  }
}

TaskListController.$inject = [
  '$scope',
  '$stateParams',
  '$state',
  'taskGateway',
  'projectGateway',
];

export default TaskListController;
