class ReportingController {

  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {Report} report
   */
  constructor(user, userPermissions, report) {
    this.user = user;
    this.userPermissions = userPermissions;
    this.report = report;
  }
}

ReportingController.$inject = [
  'user',
  'userPermissions',
  'project',
];

export default ReportingController;
