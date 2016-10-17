import moment from 'moment';

/**
 * Controller of the {@link ProjectListDirective}
 */
class ProjectListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {ProjectGateway} projectGateway
   * @param {LabelingGroupGateway} labelingGroupGateway
   * @param {ModalService} modalService
   * @param {InputDialog} InputDialog
   * @param {SelectionDialog} SelectionDialog
   */
  constructor($scope, $state, projectGateway, labelingGroupGateway, modalService, InputDialog, SelectionDialog) {
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
     * @type {LabelingGroupGateway}
     * @private
     */
    this._labelingGroupGateway = labelingGroupGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {InputDialog}
     * @private
     */
    this._InputDialog = InputDialog;

    /**
     * @type {SelectionDialog}
     * @private
     */
    this._SelectionDialog = SelectionDialog;

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
    if (this.userPermissions.canViewTaskList !== true) {
      return;
    }

    this._$state.go('labeling.tasks.list', {projectId});
  }

  /**
   * @param {number} projectId
   */
  exportProject(projectId) {
    this._$state.go('labeling.reporting.export', {projectId});
  }

  /**
   * @param {string} projectId
   * @param {string} projectName
   */
  deleteProject(projectId, projectName) {
    this._modalService.show(
      new this._InputDialog(
        {
          title: 'Delete this Project.',
          headline: `You are about to delete the "${projectName}" project. Proceed?`,
          message: ' Warning: All data related to this project will be deleted and they are no longer available. Please give a reason why you want to delete the project:',
          confirmButtonText: 'Delete',
        },
        input => {
          this.loadingInProgress = true;
          this._projectGateway.deleteProject(projectId, input)
            .then(() => this._triggerReloadAll());
        }
      )
    );
  }

  /**
   * @param {string} projectId
   */
  goToUploadPage(projectId) {
    this._$state.go('labeling.upload', {projectId});
  }

  /**
   * @param {string} projectId
   * @param {string} projectName
   * @param {boolean} projectFinished
   */
  closeProject(projectId, projectName, projectFinished) {
    if (!projectFinished && !this.userPermissions.canMoveInProgressProjectToDone) {
      this._modalService.info(
        {
          title: 'Close project',
          headline: `The project "${projectName}" can not be closed yet.`,
          message: 'There are still non finished tasks inside this project therefore it can not be closed.',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          abortable: false,
          warning: true,
        }
      );
    } else {
      this._modalService.info(
        {
          title: 'Close project',
          headline: `You are about to close the "${projectName}" project. Proceed?`,
          message: 'Closing the project moves it into the "done" state, indicating all currently assigned work has been successfully completed.',
          confirmButtonText: 'Continue',
        },
        () => {
          this.loadingInProgress = true;
          this._projectGateway.closeProject(projectId)
            .then(() => this._triggerReloadAll());
        }
      );
    }
  }

  /**
   * @param {number} projectId
   */
  reopenProject(projectId) { // eslint-disable-line no-unused-vars
    // @TODO: Implement
  }

  acceptProject(projectId, projectName) {
    this.showLoadingMask = true;

    this._labelingGroupGateway.getMyLabelingGroups().then(reponse => {
      const selectionData = reponse.labelingGroups.map(group => {
        return {id: group.id, name: group.name};
      });

      if (!selectionData.length) {
        this._modalService.info(
          {
            title: 'No labeling groups',
            headline: 'There are no labeling groups',
            message: 'You have no labeling groups that could be assigned to this project. Please create a group and try to assign this project again.',
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            abortable: false,
          }
        );
        this.showLoadingMask = false;
        return;
      }

      this._modalService.show(
        new this._SelectionDialog(
          {
            title: 'Accept project',
            headline: `You are about to accept the "${projectName}" project. Proceed?`,
            message: 'Accepting the project makes your team responsible for labeling and processing all associated tasks. Please select a team that you want to assign to this project',
            confirmButtonText: 'Accept and Assign',
            data: selectionData,
          },
          groupId => {
            if (groupId) {
              this.loadingInProgress = true;
              this._projectGateway.acceptProject(projectId, groupId)
                .then(() => this._triggerReloadAll());
            } else {
              this._modalService.info(
                {
                  title: 'No Group Selected',
                  headline: 'You need to select a labeling group',
                  message: 'You need to select a labeling group to assign to this Project. Without a selected labeling group the project can not be accepted!',
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
          }
        )
      );
      this.showLoadingMask = false;
    });
  }

  /**
   * @param {string} projectId
   */
  assignProject(projectId, taskInPreProcessingCount) {
    this.showLoadingMask = true;

    this._labelingGroupGateway.getLabelCoordinators().then(response => {
      if (!response.length) {
        this._modalService.info(
          {
            title: 'No label coordinators',
            headline: 'There are no label coordinators',
            message: 'There are no labeling coordinators that could be assigned to this project. Please contact the admin and wait for further assistance.',
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            abortable: false,
          }
        );
        this.showLoadingMask = false;
      }

      if (taskInPreProcessingCount > 0) {
        this._modalService.info(
          {
            title: 'PreProcessing Videos',
            headline: 'We are still importing videos please wait...',
            message: 'You can\'t assign this project until all videos are imported',
            confirmButtonText: 'Understood',
          },
          undefined,
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
        this.showLoadingMask = false;
        return;
      }

      this._modalService.show(
        new this._SelectionDialog(
          {
            title: 'Assign Label Coordinator',
            headline: `Select a label coordinator to assign to this project`,
            message: 'Please select a label coordinator that you want to assign to this project',
            confirmButtonText: 'Assign',
            data: response,
          },
          labelCoordinatorId => {
            if (labelCoordinatorId) {
              this.loadingInProgress = true;
              this._projectGateway.assignCoordinator(projectId, labelCoordinatorId)
                .then(() => this._triggerReloadAll());
            } else {
              this._modalService.info(
                {
                  title: 'No Label Coordinator Selected',
                  headline: 'You need to select a label coordinator',
                  message: 'You need to select a label coordinator to assign to this Project. Without a selected labeling coordinator the project can not be accepted!',
                  confirmButtonText: 'Understood',
                },
                undefined,
                undefined,
                {
                  abortable: false,
                }
              );
            }
          }
        )
      );
      this.showLoadingMask = false;
    });
  }

  /**
   * @param {number} projectId
   */
  openReport(projectId) { // eslint-disable-line no-unused-vars
    this._$state.go('labeling.reporting.list', {projectId});
  }

  _triggerReloadAll() {
    this._$scope.$emit('project-list:dependant-projects-changed');
  }

  _buildColumns(row) {
    const columns = [];

    const propertyToColumnMap = {
      'statusFormatted': 'Status',
      'name': 'Name',
      'videosCount': 'Video #',
      'taskCount': 'Job #',
      'taskInProgressCount': 'In Progress #',
      'taskFinishedCount': 'Done #',
      'taskFinishCount': 'Finished #',
      'finishedPercentageFormatted': '% finished',
      'labeledThingInFramesCount': 'Object frames',
      'totalLabelingTimeInSecondsFormatted': 'Time spent',
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
          default:
            return project.status;
        }
      },
      'creationTimestampFormatted': project => project.creationTimestamp !== undefined ? moment.unix(project.creationTimestamp).format('DD.MM.YYYY') : null,
      'dueTimestampFormatted': project => project.dueTimestamp !== undefined && project.dueTimestamp !== null ? moment.unix(project.dueTimestamp).format('DD.MM.YYYY') : null,
      'finishedPercentageFormatted': project => project.finishedPercentage !== undefined ? `${project.finishedPercentage} %` : null,
      'totalLabelingTimeInSecondsFormatted': project => {
        if (project.totalLabelingTimeInSeconds === undefined) {
          return null;
        }
        if (project.totalLabelingTimeInSeconds === 0) {
          return 'not started';
        }

        const totalMinutes = project.totalLabelingTimeInSeconds / 60;
        const time = Math.round(totalMinutes / 6) / 10;

        return `${time}h`;
      },
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
  '$scope',
  '$state',
  'projectGateway',
  'labelingGroupGateway',
  'modalService',
  'InputDialog',
  'SelectionDialog',
];

export default ProjectListController;
