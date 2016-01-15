import StatisticsListController from './StatisticsListController';
import statisticsListTemplate from './StatisticsList.html!';

class StatisticsListDirective {
  constructor() {
    this.scope = {
      taskStatistics: '=',
    };
    this.controller = StatisticsListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.template = statisticsListTemplate;
  }
}

export default StatisticsListDirective;
