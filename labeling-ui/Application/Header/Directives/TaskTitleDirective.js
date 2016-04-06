import taskTitleTemplate from './TaskTitleDirective.html!';
import TaskTitleController from './TaskTitleController';

/**
 * Directive to display the timer bar of the page
 */
class TaskTitleDirective {
  constructor() {
    this.scope = {
      name: '=',
      taskType: '=',
      frameNumberLimits: '=',
      labelInstruction: '=',
    };

    this.template = taskTitleTemplate;

    this.controller = TaskTitleController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default TaskTitleDirective;
