class ProjectController {
  /**
   * @param {User} user
   * @param {UserPermissions} userPermissions
   * @param {Array<Project>} projects
   */
  constructor(user, userPermissions, projects) {
    this.user = user;
    this.userPermissions = userPermissions;

    this.projects = projects;
  }
}

ProjectController.$inject = [
  'user',
  'userPermissions',
  'projects',
];

export default ProjectController;
