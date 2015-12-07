import taskDescriptionTemplate from './TaskDescriptionDirective.html!';
import TaskDescriptionController from './TaskDescriptionController';

/**
 * Directive to display a List of all {@link Export}s currently available for the given {@link Task}
 *
 * The directive retrieves the list automatically from the backend.
 */
class TaskDescriptionDirective {
  constructor() {
    this.scope = {
      task: '=',
    };

    this.template = taskDescriptionTemplate;

    this.controller = TaskDescriptionController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default TaskDescriptionDirective;
