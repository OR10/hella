import Module from 'Application/Module';
import ExportListDirective from './Directives/ExportListDirective';
import ExportController from './Controllers/ExportController';
import ExportGateway from './Gateway/ExportGateway';
import exportTemplate from './Views/export.html!';

/**
 * Export Module
 *
 * This module contains the {@link Export} list.
 *
 * @extends Module
 */
class Export extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    function taskResolver($stateParams, taskGateway) {
      return taskGateway.getTask($stateParams.taskId);
    }

    taskResolver.$inject = ['$stateParams', 'taskGateway'];
    $stateProvider.state('labeling.export', {
      url: 'export/:taskId',
      controller: ExportController,
      controllerAs: 'vm',
      template: exportTemplate,
      resolve: {
        task: taskResolver,
      },
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Export', []);
    this.module.service('exportGateway', ExportGateway);
    this.registerDirective('exportlist', ExportListDirective);
  }
}

Export.prototype.config.$inject = ['$stateProvider'];

export default Export;
