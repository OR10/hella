import debounce from 'lodash.debounce';

class UploadController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Object} project
   * @param {ProjectGateway} projectGateway
   * @param {ModalService} modalService
   */
  constructor($rootScope, $scope, $state, user, userPermissions, project, projectGateway, modalService) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

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
    this.project = project;

    /**
     * @type {UserPermissions}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {Function}
     */
    // Flow seems to fire this callback multiple times upon completion. No idea why.
    this.uploadComplete = debounce(() => this._uploadComplete(), 500, {leading: true, trailing: false});

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
     * @type {boolean}
     */
    this.uploadInProgress = false;

    /**
     * @type {string}
     */
    this.targetPath = `/api/project/batchUpload/${this.project.id}`;

    /**
     * @type {null|Function}
     * @private
     */
    this._unregisterUiRouterInterception = null;

    $scope.$on('$destroy', () => this._uninstallNavigationInterceptions());

    this._windowBeforeUnload = event => {
      // The message is not shown in newer chrome versions, but a generic window will be shown.
      const message = `DO NOT LEAVE THIS PAGE!\n\nAn upload is currently running. If you leave this page or close the browser window it will be stopped.\n\nPlease click 'Stay' now to continue the upload.`;
      event.returnValue = message;
      return message;
    };
  }

  _installNavigationInterceptions() {
    this._unregisterUiRouterInterception = this._$rootScope.$on('$stateChangeStart', event => {
      event.preventDefault();
      const modal = this._modalService.getAlertWarningDialog({
        title: 'Upload in progress',
        headline: 'The page can not be left, while upload is in progress.',
        message: 'While an upload is running you can not leave the upload page. You may however open a second browser window, while the upload is running.',
        confirmButtonText: 'Understood',
      });
      modal.activate();
    });

    window.addEventListener('beforeunload', this._windowBeforeUnload);
  }

  _uninstallNavigationInterceptions() {
    if (this._unregisterUiRouterInterception !== null) {
      this._unregisterUiRouterInterception();
      this._unregisterUiRouterInterception = null;
    }

    window.removeEventListener('beforeunload', this._windowBeforeUnload);
  }

  _uploadComplete() {
    this._projectGateway.markUploadAsFinished(this.project.id)
      .then(() => {
        this.uploadInProgress = false;
        this._uninstallNavigationInterceptions();
        if (this._hasFilesWithError()) {
          this._showCompletedWithErrorsModal();
        } else {
          this._showCompletedModal();
        }
      })
      .catch(() => {
        this.uploadInProgress = false;
        this._uninstallNavigationInterceptions();
        this._showCompletedWithErrorsModal();
      });
  }

  _hasFilesWithError() {
    return this.$flow.files
      .reduce((before, file) => before || file.hasUploadError(), false);
  }

  _showCompletedWithErrorsModal() {
    const modal = this._modalService.getAlertWarningDialog({
      title: 'Upload completed with errors',
      headline: 'Your upload is complete, but errors occured.',
      message: 'Some errors occurred during your upload. Please check the file list for errors and act accordingly.',
      confirmButtonText: 'Understood',
    });
    modal.activate();
  }

  _showCompletedModal() {
    const modal = this._modalService.getInfoDialog({
      title: 'Upload complete',
      headline: 'Your upload is complete',
      message: 'Your upload is complete and the task creation process has started. Do you want to go to the project list to view this project?',
      confirmButtonText: 'Go to Project List',
      cancelButtonText: 'Cancel',
    }, () => {
      this._$state.go('labeling.projects.list');
    });
    modal.activate();
  }

  uploadStarted() {
    this.uploadInProgress = true;
    this._installNavigationInterceptions();
  }

  fileAdded(file) {
    file.hasUploadError = () => false;
  }

  filesAdded(files) {
    files.forEach(file => this.fileAdded(file));
  }

  fileError(file, message) {
    file.errorMessage = JSON.parse(message).error;
    file.hasUploadError = () => true;
  }
}

UploadController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  'user',
  'userPermissions',
  'project',
  'projectGateway',
  'modalService',
];

export default UploadController;
