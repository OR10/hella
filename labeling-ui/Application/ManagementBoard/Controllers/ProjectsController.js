/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectsController {
  /**
   * @param {User} user
   * @param {Object} userPermissions
   * @param {ProjectGateway} projectGateway
   */
  constructor(user, userPermissions, projectGateway) {
    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     *
     * @type {ProjectGateway}
     * @private
     */
    this._projectGateway = projectGateway;

    /**
     * @type {Object|null}
     */
    this.projectCount = null;

    // Load count of projects in different states to display
    this._projectGateway.getProjectCount()
      .then(projectCount => this.projectCount = projectCount);
  }
}

ProjectsController.$inject = [
  'user',
  'userPermissions',
  'projectGateway',
];

export default ProjectsController;
