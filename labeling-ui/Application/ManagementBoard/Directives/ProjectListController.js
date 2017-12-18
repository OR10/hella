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

    /**
     * @type {Array.<Object>}
     */
    this.actionButtons = [];

    /**
     * @type {Array.<bool>}
     */
    this.openActionsToggle = [];

    /**
     * @type {string}
     */
    this.selectedProjectId = null;

    /**
     * @type {string}
     */
    this.actionsButtonDropDownLeftStyle = null;

    /**
     * @type {string}
     */
    this.actionsButtonDropDownTopStyle = null;

    // Reload upon request
    this._$scope.$on('project-list:reload-requested', () => {
      this.updatePage(this._currentPage, this._currentItemsPerPage);
    });

    // Listen to window resize event to redraw table progress
    angular.element(window).on('resize', () => {
      if (this.selectedProjectId !== null) {
        this.toggleActions(this.selectedProjectId);
      }
      this.projects.forEach((item, index) => {
        this.calculateTableRowHeight(index);
        $scope.$apply();
      });
    });

    angular.element(document.querySelector('#project-list-table')).bind('mousewheel', () => {
      if (this.selectedProjectId !== null) {
        this.toggleActions(this.selectedProjectId);
        $scope.$apply();
      }
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
   * @param {object} project
   */
  openProject(project) {
    const projectId = project.id;
    if (this.userPermissions.canViewTaskList !== true) {
      return;
    }

    this._$state.go('labeling.tasks.list', {projectId});
  }

  /**
   * @param {object} project
   */
  exportProject(project) {
    const projectId = project.id;
    this._$state.go('labeling.reporting.export', {projectId});
  }

  /**
   * @param {object} project
   */
  setProjectStatusToDeleted(project) {
    const projectId = project.id;
    const projectName = project.name;
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
   * @param {object} project
   */
  deleteProject(project) {
    const projectId = project.id;
    const projectName = project.name;
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
   * @param {object} project
   */
  repairProject(project) {
    const projectId = project.id;
    this.loadingInProgress = true;
    this._projectGateway.repairProject(projectId)
      .then(() => this._triggerReloadAll());
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
   * @param {object} project
   */
  closeProject(project) {
    const projectId = project.id;
    const projectName = project.name;
    const projectFinished = project.taskCount === project.taskFinishedCount;
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
   * @param {object} project
   */
  acceptProject(project) {
    const projectId = project.id;
    const projectName = project.name;
    const taskInPreProcessingCount = project.taskInPreProcessingCount;
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

  /**
   * @param {object} project
   */
  changeLabelGroupAssignment(project) {
    const projectId = project.id;
    const currentLabelingGroup = project.labelingGroupId;
    const projectName = project.name;
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
    if (startTimeStamp === undefined || endTimeStamp === undefined || startTimeStamp === null || endTimeStamp === null) {
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
      if (tr.clientHeight === 0) {
        return '46px'; // default value
      }
      return tr.clientHeight + 'px';
    }
    return '0px';
  }

  /**
   * @param {int} progress
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
   * @param {object} project
   */
  assignProject(project) {
    const projectId = project.id;
    const taskInPreProcessingCount = project.taskInPreProcessingCount;
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
   * @param {object} project
   */
  openReport(project) {
    const projectId = project.id;
    this._$state.go('labeling.reporting.list', {projectId});
  }

  /**
   * @param {object} project
   */
  showFlaggedTasks(project) {
    const projectId = project.id;
    this._$state.go('labeling.projects.flagged', {projectId});
  }

  _triggerReloadAll() {
    this._$scope.$emit('project-list:dependant-projects-changed');
  }

  _buildColumns(row) {
    const columns = [];

    const propertyToColumnMap = {
      'name': 'name',
      'creationTimestampFormatted': 'created at',
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

  /**
   * @param {Object} project
   * @returns {bool}
   */
  showUploadSpinner(project) {
    return this.userPermissions.canDeleteProject && project.status === 'deleted' && (project.deletedState === 'pending' || project.deletedState === 'in_progress');
  }

  /**
   *
   * @param {number} projectId
   */
  toggleActions(projectId) {
    Object.keys(this.openActionsToggle).forEach(actionToggle => {
      if (actionToggle === projectId) {
        this.openActionsToggle[actionToggle] = !this.openActionsToggle[actionToggle];
      } else {
        this.openActionsToggle[actionToggle] = false;
      }
    });
    this.selectedProjectId = this.openActionsToggle[projectId] === true ? projectId : null;
    this.calculatePositionOfActionButtonsDropDown(projectId);
  }

  /**
   * @param {Object} project
   * @returns {bool}
   */
  isActionDropDownVisible(project) {
    return Object.values(this.actionButtons[project.id]).filter(actionButton => actionButton.visible).length > 1;
  }

  /**
   *
   * @param {Object} project
   * @returns {Object}
   */
  createLeadAction(project) {
    const visibleActions = Object.values(this.actionButtons[project.id]).filter(actionButton => actionButton.visible);
    // maybe you will later change here the order of action buttons based on current project state
    switch (project.status) {
      case 'todo':
        break;
      case 'in_progress':
        break;
      case 'done':
        break;
      case 'delete':
        break;
      default:
        break;
    }
    this.actionButtons[project.id] = this.actionButtons[project.id].filter(actionButton => actionButton !== visibleActions[0]);
    return visibleActions[0];
  }


  /**
   * Calculate new position of actions dropdown
   */
  calculatePositionOfActionButtonsDropDown(projectId) {
    if (this.selectedProjectId !== undefined && this.selectedProjectId !== null) {
      const id = 'action-project-id-' + this.selectedProjectId;
      const clickedButtonBounds = angular.element(document.getElementById(id))[0].getBoundingClientRect();
      const left = (clickedButtonBounds.x - 140 + clickedButtonBounds.width) + 'px';
      let top;
      const actionListHeight = (this.actionButtons[projectId].filter(actionButton => actionButton.visible).length * 30.38) + 10;
      const dropDownHeight = clickedButtonBounds.y + actionListHeight;
      if (window.innerHeight < dropDownHeight + 20) {
        top = (clickedButtonBounds.y - actionListHeight - 5) + 'px';
      } else {
        top = (clickedButtonBounds.y + 28) + 'px';
      }
      this.actionsButtonDropDownLeftStyle = left;
      this.actionsButtonDropDownTopStyle = top;
    }
  }

  /**
   *
   * @param {Object} project
   */
  createActionButtons(project) {
    const uploadButton = {
      id: 'upload',
      text: this.getTooltipForUploadMedia(project),
      shortText: 'Upload',
      visible: this.userPermissions.canUploadNewVideo && project.status === 'todo',
      action: () => this.goToUploadPage(project),
      ngClass: this.isUploadTooltipDisabled(project),
      icon: 'fa-cloud-upload',
    };
    const exportButton = {
      id: 'export',
      text: 'Export Project',
      shortText: 'Export',
      visible: this.userPermissions.canExportProject && project.status !== 'deleted',
      action: () => this.exportProject(project),
      ngClass: '',
      icon: 'fa-external-link',
    };
    const flaggedTasksButton = {
      id: 'flagged',
      text: 'Show flagged Tasks',
      shortText: 'Flag',
      visible: this.userPermissions.canViewAttentionTasks && project.status !== 'deleted',
      action: () => this.showFlaggedTasks(project),
      ngClass: '',
      icon: 'fa-flag',
    };
    const acceptProjectButton = {
      id: 'accept-project',
      text: 'Accept Project and assign to team',
      shortText: 'Accept',
      visible: this.userPermissions.canAcceptProject && project.status === 'todo',
      action: () => this.acceptProject(project),
      ngClass: '',
      icon: 'fa-check-square-o',
    };
    const labelGroupAssignmentButton = {
      id: 'label-group-assignment',
      text: 'Change label group assignment',
      shortText: 'Assignment',
      visible: this.userPermissions.canChangeProjectLabelGroupAssignment && project.status === 'in_progress',
      action: () => this.changeLabelGroupAssignment(project),
      ngClass: '',
      icon: 'fa-users',
    };
    const labelManagerButton = { // eslint-disable-line no-unused-vars
      id: 'select-label-manager',
      text: project.labelManager !== undefined ? 'Selected Label Manager: ' + project.labelManager.username : 'Assign project to a Label Manager',
      shortText: 'Labelmanager',
      visible: this.userPermissions.canAssignProject && project.status === 'todo',
      action: () => this.assignProject(project),
      ngClass: project.labelManager !== undefined ? 'green' : '',
      icon: 'fa-user',
    };
    const closeProjectButton = {
      id: 'close',
      text: 'Close Project (Move to done)',
      shortText: 'Close',
      visible: this.userPermissions.canMoveInProgressProjectToDone && project.status === 'in_progress',
      action: () => this.closeProject(project),
      ngClass: '',
      icon: 'fa-check-square',
    };
    const reportButton = {
      id: 'report',
      text: 'View Report of Project',
      shortText: 'Report',
      visible: this.userPermissions.canViewProjectReport && project.status !== 'deleted',
      action: () => this.openReport(project),
      ngClass: '',
      icon: 'fa-file',
    };
    const deleteButton = {
      id: 'delete-status',
      text: 'Delete this Project. Data can be shown in delete tap',
      shortText: 'Delete',
      visible: this.userPermissions.canDeleteProject && (project.status === 'todo' || project.status === 'done'),
      action: () => this.setProjectStatusToDeleted(project),
      ngClass: '',
      icon: 'fa-trash-o',
    };
    const deleteFinallyButton = {
      id: 'delete-finally',
      text: 'Delete this Project. Warning: All data related to this project will be deleted and they are no longer available.',
      shortText: 'Delete',
      visible: this.userPermissions.canDeleteProject && project.status === 'deleted' && project.deletedState === 'unaccepted',
      action: () => this.deleteProject(project),
      ngClass: '',
      icon: 'fa-trash-o icon-fa warning-color',
    };
    const repairButton = {
      id: 'repair',
      text: 'Repair tasks',
      shortText: 'Repair',
      visible: this.userPermissions.canRepairProject && project.status !== 'deleted',
      action: () => this.repairProject(project),
      ngClass: '',
      icon: 'fa-wrench icon-fa',
    };

    this.actionButtons[project.id] = [
      uploadButton,
      exportButton,
      flaggedTasksButton,
      acceptProjectButton,
      labelGroupAssignmentButton,
      // labelManagerButton,
      closeProjectButton,
      reportButton,
      deleteButton,
      deleteFinallyButton,
      repairButton,
    ];

    this.openActionsToggle[project.id] = false;
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
