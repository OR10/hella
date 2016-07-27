class ReportingListController {

  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {ReportGateway} reportGateway
   * @param {ModalService} modalService
   * @param {Project} project
   */
  constructor(user, userPermissions, reportGateway, modalService, project) {
    this.user = user;
    this.userPermissions = userPermissions;
    this._reportGateway = reportGateway;
    this._modalService = modalService;
    this.project = project;
    this.reports = [];
  }

  startReport() {
    this._reportGateway.startReport(this.project.id).then(() => {
      const modal = this._modalService.getInfoDialog({
        title: 'Report in progress',
        headline: 'The requested Report operation has been triggered',
        message: `The requested report has been triggered. It will be processed and should be available in this view shortly.`,
        confirmButtonText: 'Understood',
        cancelButtonText: false,
      }, () => {
        this._loadReportList();
      });
      modal.activate();
    });
  }

  /**
   * Retrieve a fresh list of {@link Report} objects from the backend.
   *
   * @private
   */
  _loadReportList() {
    this.loadingInProgress = true;
    this._reportGateway.getReports(this.project.id)
      .then(reports => {
        this.reports = reports;
        this.loadingInProgress = false;
      });
  }
}

ReportingListController.$inject = [
  'user',
  'userPermissions',
  'reportGateway',
  'modalService',
  'project',
];

export default ReportingListController;
