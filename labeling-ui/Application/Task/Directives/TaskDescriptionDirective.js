import taskDescriptionTemplate from './TaskDescriptionDirective.html!';

/**
 * Directive to display a List of all {@link Export}s currently available for the given {@link Task}
 *
 * The directive retrieves the list automatically from the backend.
 */
class TaskDescriptionDirective {
  constructor() {
    this.scope = {
      taskDescription: '@',
    };

    this.template = taskDescriptionTemplate;
  }
}

export default TaskDescriptionDirective;
