import taskListTemplate from './TaskListDirective.html!';
import TaskListController from './TaskListController';

/**
 * Directive to display a List of all {@link Task}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class TaskListDirective {
  constructor() {
    this.scope = {
      projectId: '=',
      user: '=',
      userPermissions: '=',
    };

    this.template = taskListTemplate;

    this.controller = TaskListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}


export default TaskListDirective;
