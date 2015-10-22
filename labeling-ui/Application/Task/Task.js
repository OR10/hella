import Module from '../Module';
import TaskService from './Services/TaskService';
import TaskController from './Controllers/TaskController';
import taskTemplate from './Views/task.html!';

export default class Task extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Task', []);

    this.module.service('taskService', TaskService);
  }

  config($stateProvider) {
    const taskResolver = ($stateParams, taskService) => {
      return taskService.getTask($stateParams.taskId);
    };

    taskResolver.$inject = ['$stateParams', 'taskService'];

    $stateProvider.state('task', {
      url: '/task/:taskId',
      controller: TaskController,
      controllerAs: 'vm',
      template: taskTemplate,
      resolve: {
        task: taskResolver,
      },
    });
  }
}

Task.prototype.config.$inject = ['$stateProvider'];
