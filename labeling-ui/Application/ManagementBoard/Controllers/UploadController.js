/**
 * Controller for the initial entrypoint route into the application
 */
class UploadController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Object} project
   */
  constructor($scope, user, userPermissions, project) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

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
     * @type {boolean}
     */
    this.uploadLoadingMask = false;

    /**
     * @type {string}
     */
    this.targetPath = `/api/project/batchUpload/${this.project.id}`;
  }

  uploadComplete() {
    // Trigger backened route /api/project/batchUpload/{projectId}/complete
    this.uploadLoadingMask = false;
  }

  uploadStarted() {
    this.uploadLoadingMask = true;
  }

  fileError(file, message) {
    file.errorMessage = JSON.parse(message).error;
  }
}

UploadController.$inject = [
  '$scope',
  'user',
  'userPermissions',
  'project',
];

export default UploadController;
