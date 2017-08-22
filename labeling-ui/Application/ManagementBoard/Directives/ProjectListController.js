import moment from 'moment';
import BytesFormatter from '../../Common/Helpers/BytesFormatter';
import angular from 'angular';

/**
 * Controller of the {@link ProjectListDirective}
 */
class ProjectListController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {angular.$q} $q
   * @param {ProjectGateway} projectGateway
   * @param {LabelingGroupGateway} labelingGroupGateway
   * @param {ModalService} modalService
   * @param {InputDialog} InputDialog
   * @param {SelectionDialog} SelectionDialog
   * @param {UserGateway} userGateway
   */
  constructor($scope, $state, $q, projectGateway, labelingGroupGateway, modalService, InputDialog, SelectionDialog, userGateway) {
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
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

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
     * @type {UserGateway}
     * @private
     */
    this._userGateway = userGateway;

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

    /**
     * @type {Object}
     */
    this.projectCreators = new Map();

    // Reload upon request
    this._$scope.$on('project-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });

    // Listen to window resize event to redraw table progress
    angular.element(window).on('resize', () => {
      this.projects.forEach((item, index) => {
        this.calculateTableRowHeight(index);
        $scope.$apply();
      });
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

        response.result = response.result.map(project => {
          const labelManagerId = project.labelManager;
          if (labelManagerId !== undefined) {
            project.labelManager = response.users[labelManagerId];
          }
          return project;
        });

        this.projects = this._createViewData(response.result);
        this.columns = this._buildColumns(this.projects[0]);
        this._getProjectCreatorsForAllProjects().then(() => {
          this.loadingInProgress = false;
        });
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
  setProjectStatusToDeleted(projectId, projectName) {
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
          this._projectGateway.setProjectStatusToDeleted(projectId, input)
            .then(() => this._triggerReloadAll());
        }
      )
    );
  }

  /**
   * @param {string} projectId
   * @param {string} projectName
   */
  deleteProject(projectId, projectName) {
    this._modalService.info(
      {
        title: 'Delete this Project.',
        headline: `You are about to delete the "${projectName}" project. Proceed?`,
        message: 'Warning: All data related to this project will be deleted and they are no longer available. Note that this is an irreversible operation!',
        confirmButtonText: 'Continue',
      },
      () => {
        this.loadingInProgress = true;
        this._projectGateway.deleteProject(projectId)
          .then(() => this._triggerReloadAll());
      }
    );
  }

  /**
   * @param {Object} project
   */
  goToUploadPage(project) {
    const projectId = project.id;
    if (project.projectOwnerIsCurrentUser === true) {
      this._$state.go('labeling.upload', {projectId});
    }
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

  acceptProject(projectId, projectName, taskInPreProcessingCount) {
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

      if (taskInPreProcessingCount > 0) {
        this._showPreProcessingVideoInfoModal();
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

  changeLabelGroupAssignment(projectId, currentLabelingGroup, projectName) {
    this.showLoadingMask = true;

    this._labelingGroupGateway.getMyLabelingGroups().then(reponse => {
      const selectionData = reponse.labelingGroups.filter(group => {
        return group.id !== currentLabelingGroup;
      }).map(group => {
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
            title: 'Change Label-Group Assignment',
            headline: `You are about to change the Label-Group for Project "${projectName}".`,
            message: 'This will remove all task assignments for all users in this project!',
            confirmButtonText: 'Change labelgroup and clean task assignments',
            data: selectionData,
          },
          groupId => {
            if (groupId) {
              this.loadingInProgress = true;
              this._projectGateway.changeLabelGroupAssignment(projectId, groupId)
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
   * Calculate the project progress by start date and due date
   * @param {Object} project
   * @returns {Object}
   */
  calculateProjectProgressFromDuration(project) {
    if (project === undefined) {
      return null;
    }
    const startTimeStamp = project.creationTimestamp;
    const endTimeStamp = project.dueTimestamp;
    if (startTimeStamp === null || endTimeStamp === null) {
      return null;
    }
    const endDate = moment.unix(endTimeStamp);
    const startDate = moment.unix(startTimeStamp);
    const projectDuration = moment.duration(endDate.diff(startDate)).asDays();
    const currentProgress = moment.duration(moment().diff(startDate)).asDays();

    let colorClass = this._getBackgroundColorForProgress(null);

    if (projectDuration > currentProgress) {
      // project is in due date
      const progress = Math.round((currentProgress) * 100 / projectDuration);
      colorClass = this._getBackgroundColorForProgress(progress);
      if (progress === 0) {
        return {progress: '-99%', class: colorClass};
      }
      return {progress: progress - 100 + '%', class: colorClass};
    }
    // project is out of due date
    return {progress: '0%', class: colorClass};
  }

  /**
   * Returns the height of complete row because it will dynamically rendered.
   * @param {int} index
   * @returns {String}
   */
  calculateTableRowHeight(index) {
    const trs = angular.element(document.querySelectorAll('.view-list-table tbody tr'));
    if (trs.length !== 0) {
      const tr = trs[index + 1];
      return tr.clientHeight + 'px';
    }
    return '0px';
  }

  /**
   * @param {Number} progress
   * @returns {String}
   */
  _getBackgroundColorForProgress(progress) {
    if (progress === null) {
      return 'red-progress-color';
    }
    if (progress > 80) {
      return 'red-progress-color';
    }
    return 'yellow-progress-color';
  }

  /**
   * @param {string} projectId
   */
  assignProject(projectId, taskInPreProcessingCount) {
    this.showLoadingMask = true;

    this._labelingGroupGateway.getLabelManagers().then(response => {
      if (!response.length) {
        this._modalService.info(
          {
            title: 'No label Label Managers',
            headline: 'There are no Label Managers',
            message: 'There are no Label Managers that could be assigned to this project.',
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
        this._showPreProcessingVideoInfoModal();
        return;
      }

      this._modalService.show(
        new this._SelectionDialog(
          {
            title: 'Assign Label Manager',
            headline: `Select a Label Manager to assign to this project`,
            message: 'Please select a Label Manager that you want to assign to this project',
            confirmButtonText: 'Assign',
            data: response,
          },
          labelManagerId => {
            if (labelManagerId) {
              this.loadingInProgress = true;
              this._projectGateway.assignLabelManager(projectId, labelManagerId)
                .then(() => this._triggerReloadAll());
            } else {
              this._modalService.info(
                {
                  title: 'No Label Manager Selected',
                  headline: 'You need to select a Label Manager',
                  message: 'You need to select a Label Manager to assign to this Project. Without a selected labeling manager the project can not be accepted!',
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

  _showPreProcessingVideoInfoModal() {
    this._modalService.info(
      {
        title: 'PreProcessing Videos',
        headline: 'We are still importing videos please wait...',
        message: 'You can\'t assign this project until all videos are processed',
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
  }

  /**
   * @param {number} projectId
   */
  openReport(projectId) { // eslint-disable-line no-unused-vars
    this._$state.go('labeling.reporting.list', {projectId});
  }

  showFlaggedTasks(projectId) {
    this._$state.go('labeling.projects.flagged', {projectId});
  }

  _triggerReloadAll() {
    this._$scope.$emit('project-list:dependant-projects-changed');
  }

  _buildColumns(row) {
    const columns = [];

    const propertyToColumnMap = {
      'name': 'name',
      'dueTimestampFormatted': 'deadline',
      'videosCount': 'media',
      'taskCount': 'jobs',
      'frameCount': 'frames',
      'taskInProgressCount': 'process',
      'taskFinishedCount': 'done',
      'totalLabelingTimeInSecondsFormatted': 'time',
      'labeledThingInFramesCount': 'object frames',
      'diskUsageTotal': 'disk usage',
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
      // TODO: This could be later use to calculate table process
      'creationTimestampFormatted': project => project.creationTimestamp !== undefined ? moment.unix(project.creationTimestamp).format('DD.MM.YYYY') : null,
      'dueTimestampFormatted': project => project.dueTimestamp !== undefined && project.dueTimestamp !== null ? moment.unix(project.dueTimestamp).format('DD.MM.YYYY') : 'not set',
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
      'diskUsageTotal': project => {
        const filter = new BytesFormatter();
        if (project.diskUsage.total === undefined) {
          return filter.format(0);
        }
        return filter.format(project.diskUsage.total);
      },
      'frameCount': project => project.totalFrames !== undefined ? project.totalFrames : null,
      'projectOwnerIsCurrentUser': project => { return this._projectOwnerIsCurrentUser(project); },
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

  /**
   * If you want to add videos to a project only the user which creates the project can do this. So with this method you
   * you can check if the current logged in user is also the project creator
   *
   * @param {Object} project
   * @returns {boolean}
   * @private
   */
  _projectOwnerIsCurrentUser(project) {
    const currentUserId = this.user.id;
    return currentUserId === project.userId;
  }

  /**
   * Load the users that create the project to show his username in tooltip
   *
   * returns {AbortablePromise<Array>}
   * @private
   */
  _getProjectCreatorsForAllProjects() {
    const promises = [];
    this.projects.forEach(project => {
      if (this.projectCreators.has(project.userId) === false) {
        const promise = this._userGateway.getUser(project.userId).then(user => {
          this.projectCreators.set(project.userId, user);
        });
        promises.push(promise);
      }
    });
    return this._$q.all(promises);
  }

  /**
   * @param {Object} project
   * @returns {string}
   */
  getTooltipForUploadMedia(project) {
    if (project.projectOwnerIsCurrentUser === true) {
      return 'Upload Media';
    }
    if (this.projectCreators.get(project.userId) === undefined) {
      return 'You are not allowed to upload media';
    }

    return 'Only ' + this.projectCreators.get(project.userId).username + ' can upload media';
  }

  /**
   * @param {Object} project
   * @returns {string}
   */
  isUploadTooltipDisabled(project) {
    if (project.projectOwnerIsCurrentUser === false) {
      return 'disabled';
    }
    return '';
  }
}

ProjectListController.$inject = [
  '$scope',
  '$state',
  '$q',
  'projectGateway',
  'labelingGroupGateway',
  'modalService',
  'InputDialog',
  'SelectionDialog',
  'userGateway',
];

export default ProjectListController;
