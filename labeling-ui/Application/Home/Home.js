import Module from 'Application/Module';
import TaskListDirective from './Directives/TaskListDirective';
import TitleBarDirective from '../Header/Directives/TitleBarDirective';
import HomeController from './Controllers/HomeController';
import homeTemplate from './Views/home.html!';

/**
 * Home Module
 *
 * This module contains all necessary modules directly involved in providing the initial application entry point.
 *
 * @extends Module
 */
class Home extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    $stateProvider.state('labeling.tasks', {
      url: 'tasks',
      controller: HomeController,
      controllerAs: 'vm',
      template: homeTemplate,
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Home', []);
    this.registerDirective('tasklist', TaskListDirective);
    this.registerDirective('titleBar', TitleBarDirective);
  }
}

Home.prototype.config.$inject = ['$stateProvider'];

export default Home;
