import Module from '../Module';
import TaskGateway from './Gateways/TaskGateway';
import LabelStructureGateway from './Gateways/LabelStructureGateway';
import FrameIndexService from './Services/FrameIndexService';
import TaskController from './Controllers/TaskController';
import taskTemplate from './Views/task.html!';

import TaskDescriptionDirective from './Directives/TaskDescriptionDirective';
import PopupPanelDirective from './Directives/PopupPanelDirective';

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
    this.module.service('labelStructureGateway', LabelStructureGateway);
    this.module.service('FrameIndexService', FrameIndexService);
    this.registerDirective('taskDescription', TaskDescriptionDirective);
    this.registerDirective('popupPanel', PopupPanelDirective);
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

    $stateProvider.state('labeling.task', {
      url: 'task/:taskId',
      controller: TaskController,
      controllerAs: 'vm',
      template: taskTemplate,
      reloadOnSearch: false,
      resolve: {
        initialData: initialDataResolver,
      },
    });
  }
}

Task.prototype.config.$inject = ['$stateProvider'];

export default Task;
