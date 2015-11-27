import Module from '../Module';
import TaskGateway from './Gateways/TaskGateway';
import TaskController from './Controllers/TaskController';
import taskTemplate from './Views/task.html!';

/**
 * Module containing all functionality associated with a {@link Task}
 *
 * @extends Module
 */
class Task extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Task', []);

    this.module.service('taskGateway', TaskGateway);
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    function initialDataResolver($stateParams, taskGateway, videoGateway) {
      return taskGateway.getTask($stateParams.taskId)
        .then(
          task => videoGateway.getVideo(task.videoId)
            .then(video => ({task, video}))
        );
    }
    initialDataResolver.$inject = ['$stateParams', 'taskGateway', 'videoGateway'];

    $stateProvider.state('task', {
      url: '/task/:taskId',
      controller: TaskController,
      controllerAs: 'vm',
      template: taskTemplate,
      resolve: {
        initialData: initialDataResolver,
      },
    });
  }
}

Task.prototype.config.$inject = ['$stateProvider'];

export default Task;
