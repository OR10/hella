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

    this.projects = projects.map(stat => {
      const hours = Math.floor(stat.totalLabelingTimeInSeconds / 3600);
      const minutes = Math.floor(stat.totalLabelingTimeInSeconds % 3600 / 60);

      stat.timeSpent = {hours, minutes};

      return stat;
    });
  }
}

ProjectController.$inject = [
  'user',
  'userPermissions',
  'projects',
];

export default ProjectController;
