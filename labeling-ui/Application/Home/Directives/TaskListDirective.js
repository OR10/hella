import taskListTemplate from './TaskListDirective.html!';
import TaskListController from '../Controllers/TaskListController';

export default class TaskListDirective {
  constructor() {
    this.template = taskListTemplate;

    this.controller = TaskListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
