import moment from 'moment';

/**
 * Controller of the {@link ProjectListDirective}
 */
class ProjectListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {ProjectGateway} projectGateway
   * @param {ModalService} modalService
   */
  constructor($scope, $state, projectGateway, modalService) {
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
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {Array}
     */
    this.projects = [];

    /**
     * @type {Array}
     */
    this.columns = [];

    /**
     * @type {number}
     */
    this.totalRows = 0;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {number}
     * @private
     */
    this._currentPage = 1;

    /**
     * @type {number}
     * @private
     */
    this._currentItemsPerPage = 0;

    // Reload upon request
    this._$scope.$on('project-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });
  }

  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

    this._currentPage = page;
    this._currentItemsPerPage = itemsPerPage;

    const limit = itemsPerPage;
    const offset = (page - 1) * itemsPerPage;

    this._projectGateway.getProjects(this.projectStatus, limit, offset)
      .then(response => {
        this.totalRows = response.totalRows;

        if (response.result.length === 0) {
          this.columns = [];
          this.projects = [];
          this.loadingInProgress = false;
          return;
        }

        this.projects = this._createViewData(response.result);
        this.columns = this._buildColumns(this.projects[0]);

        this.loadingInProgress = false;
      });
  }

  /**
   * @param {number} projectId
   */
  openProject(projectId) {
    this._$state.go('labeling.tasks.list', {projectId});
  }

  /**
   * @param {number} projectId
   */
  exportProject(projectId) {
    this._$state.go('labeling.projects.export', {projectId});
  }

  /**
   * @param {number} projectId
   */
  deleteProject(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  closeProject(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  reopenProject(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
  }

  acceptProject(projectId, projectName) {
    const modal = this._modalService.getWarningDialog({
      title: 'Accept project',
      headline: `You are about to accept the "${projectName}" project. Proceed?`,
      message: 'Accepting the project makes your team responsible for labeling and processing all associated tasks.',
      confirmButtonText: 'Accept',
      cancelButtonText: 'Cancel',
    }, () => {
      this.loadingInProgress = true;
      this._projectGateway.acceptProject(projectId)
        .then(() => this._triggerReloadAll());
    });
    modal.activate();
  }

  /**
   * @param {number} projectId
   */
  openReport(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
  }

  _triggerReloadAll() {
    this._$scope.$emit('project-list:dependant-projects-changed');
  }

  _buildColumns(row) {
    const columns = [];

    const propertyToColumnMap = {
      'statusFormatted': 'Status',
      'name': 'Name',
      'videoCount': 'Video Count',
      'taskCount': 'Task Count',
      'taskInProgressCount': 'In Progress #',
      'taskFinishCount': 'Finished #',
      'finishedPercentageFormatted': '% finished',
      'objectFrameCount': 'Object frames',
      'timeInProject': 'Time spent',
      'creationTimestampFormatted': 'Started',
      // 'dueTimestampFormatted': 'Due date',
    };

    Object.keys(propertyToColumnMap).forEach(
      property => {
        if (row.hasOwnProperty(property)) {
          columns.push({name: propertyToColumnMap[property], property});
        }
      }
    );

    return columns;
  }

  _createViewData(projects) {
    const augmentedMapping = {
      'statusFormatted': project => {
        switch (project.status) {
          case 'todo':
            return 'Todo';
          case 'in_progress':
            return 'In Progress';
          case 'done':
            return 'Done';
          default:
            return project.status;
        }
      },
      'creationTimestampFormatted': project => project.creationTimestamp !== undefined ? moment.unix(project.creationTimestamp).format('DD.MM.YYYY') : null,
      'dueTimestampFormatted': project => project.dueTimestamp !== undefined ? moment.unix(project.dueTimestamp).format('DD.MM.YYYY') : null,
      'finishedPercentageFormatted': project => project.finishedPercentage !== undefined ? `${project.finishedPercentage} %` : null,
    };

    return projects.map(project => {
      const augmentedObject = Object.assign({}, project);
      Object.keys(augmentedMapping).forEach(
        property => {
          const augmentedProperty = augmentedMapping[property](project);
          if (augmentedProperty !== null) {
            augmentedObject[property] = augmentedProperty;
          }
        }
      );
      return augmentedObject;
    });
  }
}

ProjectListController.$inject = [
  '$state',
  'projectGateway',
];

export default ProjectListController;
