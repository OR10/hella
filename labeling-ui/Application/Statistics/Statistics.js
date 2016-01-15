import Module from 'Application/Module';
import StatisticsGateway from './Gateways/StatisticsGateway';
import StatisticsListDirective from './Directives/StatisticsListDirective';
import StatisticsController from './Controllers/StatisticsController';
import statisticsTemplate from './Views/statistics.html!';

/**
 * Statistics Module
 *
 * This module contains all necessary modules directly involved in providing statistical data about labeling tasks.
 *
 * @extends Module
 */
class Statistics extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    function taskStatisticsResolver(statisticsGateway) {
      return statisticsGateway.getTaskStatistics();
    }

    taskStatisticsResolver.$inject = ['statisticsGateway'];

    $stateProvider.state('labeling.statistics', {
      url: 'tasks/statistics',
      controller: StatisticsController,
      controllerAs: 'vm',
      template: statisticsTemplate,
      resolve: {
        taskStatistics: taskStatisticsResolver,
      },
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Statistics', []);
    this.module.service('statisticsGateway', StatisticsGateway);
    this.registerDirective('statisticsList', StatisticsListDirective);
  }
}

Statistics.prototype.config.$inject = ['$stateProvider'];

export default Statistics;
