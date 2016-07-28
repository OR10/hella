class ReportingController {

  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {Project} project
   * @param {Report} report
   */
  constructor(user, userPermissions, project, report) {
    this.user = user;
    this.userPermissions = userPermissions;
    this.project = project;
    this.report = report;

    console.log(project, report);
  }
}

ReportingController.$inject = [
  'user',
  'userPermissions',
  'project',
  'report',
];

export default ReportingController;
