/**
 * Controller for the initial entrypoint route into the application
 */
class ProjectsController {
  /**
   * @param {User} user
   * @param {Object} userPermissions
   * @param {ProjectListLazyStoreService} projectListLazyStore
   */
  constructor(user, userPermissions, projectListLazyStore) {
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
     * @type {ProjectListLazyStoreService}
     * @private
     */
    this._projectStoreLazyStore = projectListLazyStore;

    /**
     * @type {number|null}
     */
    this.projectTodoCount = null;

    /**
     * @type {number|null}
     */
    this.projectInProgressCount = null;

    /**
     * @type {number|null}
     */
    this.projectDoneCount = null;

    // Load count of projects in different states to display
    this._projectStoreLazyStore.getProjectCount('todo').then(count => this.projectTodoCount = count);
    this._projectStoreLazyStore.getProjectCount('in_progress').then(count => this.projectInProgressCount = count);
    this._projectStoreLazyStore.getProjectCount('done').then(count => this.projectDoneCount = count);
  }
}

ProjectsController.$inject = [
  'user',
  'userPermissions',
  'projectListLazyStoreService',
];

export default ProjectsController;
