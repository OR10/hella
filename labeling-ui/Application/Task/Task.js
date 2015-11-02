import Module from '../Module';
import TaskGateway from './Gateways/TaskGateway';
import TaskController from './Controllers/TaskController';
import taskTemplate from './Views/task.html!';

export default class Task extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Task', []);

    this.module.service('taskGateway', TaskGateway);
  }

  config($stateProvider) {
    const taskResolver = ($stateParams, taskGateway) => {
      return taskGateway.getTask($stateParams.taskId);
    };

    taskResolver.$inject = ['$stateParams', 'taskGateway'];

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
