import flaggedListTemplate from './FlaggedTaskListDirective.html!';
import TaskListController from './FlaggedTaskListController';

/**
 * Directive to display a List of all {@link Task}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class FlaggedTaskListDirective {
  constructor() {
    this.scope = {
      project: '=',
      user: '=',
      userPermissions: '=',
    };

    this.template = flaggedListTemplate;

    this.controller = TaskListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}


export default FlaggedTaskListDirective;
