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
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  deleteProject(projectId) {
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  closeProject(projectId) {
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  reopenProject(projectId) {
    // @TODO: Implement
  }

  /**
   * @param {number} projectId
   */
  openReport(projectId) {
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
      'percentage': '% finished',
      'objectFrameCount': 'Object frames',
      'timeInProject': 'Time spent',
      'creationTimestampFormatted': 'Started',
      'dueTimestampFormatted': 'Due date',
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
        }
      },
      'percentage': project => Math.round((project.taskFinishedCount / project.taskCount) * 100) + '%',
      'creationTimestampFormatted': project => moment.unix(project.creationTimestamp).format('DD.MM.YYYY'),
      'dueTimestampFormatted': project => moment.unix(project.dueTimestamp).format('DD.MM.YYYY'),
    };

    return projects.map(project => {
      const augmentedObject = Object.assign({}, project);
      Object.keys(augmentedMapping).forEach(
        property => augmentedObject[property] = augmentedMapping[property](project)
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
