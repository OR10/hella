import Module from '../Module';
import TaskGateway from './Gateways/TaskGateway';
import LabelStructureGateway from './Gateways/LabelStructureGateway';
import FrameIndexService from './Services/FrameIndexService';
import TaskController from './Controllers/TaskController';
import toFrameNumberFilterProvider from './Filters/toFrameNumberFilterProvider';
import taskTemplate from './Views/task.html!';

import TaskDescriptionDirective from './Directives/TaskDescriptionDirective';
import PopupPanelDirective from './Directives/PopupPanelDirective';

/**
 * Module containing all functionality associated with a {@link Task}
 *
 * @extends Module
 */
class TaskModule extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Task', []);

    this.module.service('taskGateway', TaskGateway);
    this.module.service('labelStructureGateway', LabelStructureGateway);
    this.module.service('frameIndexService', FrameIndexService);
    this.registerDirective('taskDescription', TaskDescriptionDirective);
    this.registerDirective('popupPanel', PopupPanelDirective);
    this.module.filter('toFrameNumber', toFrameNumberFilterProvider);
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    /**
     * @param {Object} $stateParams
     * @param {TaskGateway} taskGateway
     * @param {VideoGateway} videoGateway
     * @returns {AbortablePromise}
     */
    function initialDataResolver($stateParams, taskGateway, videoGateway) {
      return taskGateway.getTask($stateParams.taskId)
        .then(
          task => videoGateway.getVideo(task.videoId)
            .then(video => ({task, video}))
        );
    }

    initialDataResolver.$inject = [
      '$stateParams',
      'taskGateway',
      'videoGateway',
    ];

    $stateProvider.state('labeling.tasks.detail', {
      url: '/:taskId',
      views: {
        '@': {
          controller: TaskController,
          controllerAs: 'vm',
          template: taskTemplate,
        },
      },
      resolve: {
        initialData: initialDataResolver,
      },
    });
  }
}

TaskModule.prototype.config.$inject = [
  '$stateProvider',
];

export default TaskModule;
