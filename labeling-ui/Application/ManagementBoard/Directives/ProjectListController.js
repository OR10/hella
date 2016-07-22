import moment from 'moment';

/**
 * Controller of the {@link ProjectListDirective}
 */
class ProjectListController {
  /**
   * @param {$state} $state
   * @param {ProjectGateway} projectGateway
   */
  constructor($state, projectGateway) {
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
  }

  updatePage(page, itemsPerPage) {
    this.loadingInProgress = true;

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

  /**
   * @param {number} projectId
   */
  openReport(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
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
