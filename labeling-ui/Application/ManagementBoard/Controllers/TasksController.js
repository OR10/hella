/**
 * Controller for the initial entrypoint route into the application
 */
class TasksController {
  constructor($stateParams, user, userPermissions) {
    this.user = user;
    this.userPermissions = userPermissions;

    this.projectId = $stateParams.projectId;
  }
}

TasksController.$inject = [
  '$stateParams',
  'user',
  'userPermissions',
];

export default TasksController;
