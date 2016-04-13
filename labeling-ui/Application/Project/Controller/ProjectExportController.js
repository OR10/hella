class ProjectExportController {

  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {ProjectGateway} projectGateway
   * @param {ModalService} modalService
   * @param {Project} project
   */
  constructor(user, userPermissions, projectGateway, modalService, project) {
    this.user = user;
    this.userPermissions = userPermissions;
    this._projectGateway = projectGateway;
    this._modalService = modalService;
    this.project = project;

    this._loadExportList();
  }

  /**
   * Start an export in a given format
   */
  startExport() {
    this._projectGateway.startExport(this.project.id).then(() => {
      const modal = this._modalService.getInfoDialog({
        title: 'Export in progress',
        headline: 'The requested Export operation has been triggered',
        message: `The requested export has been triggered. It will be processed and should be available in this view shortly.`,
        confirmButtonText: 'Understood',
        cancelButtonText: false,
      }, () => {
        this._loadExportList();
      });
      modal.activate();
    });
  }

  /**
   * Retrieve a fresh list of {@link Export} objects from the backend.
   *
   * @private
   */
  _loadExportList() {
    this.loadingInProgress = true;
    this._projectGateway.getExports(this.project.id)
      .then((exports) => {
        this.exports = exports;
        this.loadingInProgress = false;
      });
  }

}

ProjectExportController.$inject = [
  'user',
  'userPermissions',
  'projectGateway',
  'modalService',
  'project',
];

export default ProjectExportController;
