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

  uploadComplete() {
    this._projectGateway.markUploadAsFinished(this.project.id).then(() => {
      this.uploadLoadingMask = false;
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
    }).catch(() => {
      this.uploadLoadingMask = false;
    });
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
