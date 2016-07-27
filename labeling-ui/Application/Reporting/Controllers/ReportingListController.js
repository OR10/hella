class ReportingListController {

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
    this.reports = [];
  }

  startReport() {
    // @TODO: implement
  }
}

ReportingListController.$inject = [
  'user',
  'userPermissions',
  'projectGateway',
  'modalService',
  'project',
];

export default ReportingListController;
