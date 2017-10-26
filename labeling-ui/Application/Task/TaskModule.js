import Module from '../Module';
import TaskGateway from './Gateways/TaskGateway';
import LabelStructureGateway from './Gateways/LabelStructureGateway';
import FrameIndexService from './Services/FrameIndexService';
import TaskController from './Controllers/TaskController';
import toFrameNumberFilterProvider from './Filters/toFrameNumberFilterProvider';
import taskTemplate from './Views/task.html!';

import LabelStructureService from './Services/LabelStructureService';
import LabelStructureDataService from './Services/LabelStructureDataService';

import LabeledThingReferentialCheckService from './Services/LabeledThingReferentialCheckService';

import TaskDescriptionDirective from './Directives/TaskDescriptionDirective';
import PopupPanelDirective from './Directives/PopupPanelDirective';
import ToolSelectorDirective from './Directives/ToolSelectorDirective';
import InitialDataResolver from './Resolvers/InitialDataResolver';
import ShapeInboxObjectService from './Services/ShapeInboxObjectService';
import ShapeInboxLabelService from './Services/ShapeInboxLabelService';
import InboxShapeNameInputDirective from './Directives/InboxShapeNameInputDirective';

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
    this.module.service('labelStructureService', LabelStructureService);
    this.module.service('labelStructureDataService', LabelStructureDataService);
    this.module.service('labeledThingReferentialCheckService', LabeledThingReferentialCheckService);
    this.module.service('shapeInboxObjectService', ShapeInboxObjectService);
    this.module.service('shapeInboxLabelService', ShapeInboxLabelService);
    this.registerDirective('taskDescription', TaskDescriptionDirective);
    this.registerDirective('popupPanel', PopupPanelDirective);
    this.registerDirective('toolSelector', ToolSelectorDirective);
    this.registerDirective('inboxShapeNameInput', InboxShapeNameInputDirective);
    this.module.filter('toFrameNumber', toFrameNumberFilterProvider);
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    $stateProvider.state('labeling.tasks.detail', {
      url: '/:taskId/:phase',
      applicationLoadingMask: true,
      loadingMessage: 'Loading task data...',
      views: {
        '@labeling': {
          controller: TaskController,
          controllerAs: 'vm',
          template: taskTemplate,
        },
      },
      resolve: {
        initialData: InitialDataResolver,
      },
    });
  }
}

TaskModule.prototype.config.$inject = [
  '$stateProvider',
];

export default TaskModule;
