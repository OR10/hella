import debounce from 'lodash.debounce';

class UploadController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {$state} $state
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Object} project
   * @param {ProjectGateway} projectGateway
   * @param {ModalService} modalService
   */
  constructor($scope, $state, user, userPermissions, project, projectGateway, modalService) {
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
    this.uploadLoadingMask = false;

    /**
     * @type {string}
     */
    this.targetPath = `/api/project/batchUpload/${this.project.id}`;
  }

  _uploadComplete() {
    this._projectGateway.markUploadAsFinished(this.project.id)
      .then(() => {
        this.uploadLoadingMask = false;
        if (this._hasFilesWithError()) {
          this._showCompletedWithErrorsModal();
        } else {
          this._showCompletedModal();
        }
      })
      .catch(() => {
        this.uploadLoadingMask = false;
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
    this.uploadLoadingMask = true;
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
  '$scope',
  '$state',
  'user',
  'userPermissions',
  'project',
  'projectGateway',
  'modalService',
];

export default UploadController;
