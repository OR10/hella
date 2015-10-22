import Module from 'Application/Module';
import TaskListDirective from './Directives/TaskListDirective';
import HomeController from './Controllers/HomeController';
import homeTemplate from './Views/home.html!';

export default class Home extends Module {
  config($stateProvider) {
    $stateProvider.state('home', {
      url: '/',
      controller: HomeController,
      controllerAs: 'vm',
      template: homeTemplate,
    });
  }

  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Home', []);
    this.registerDirective('tasklist', TaskListDirective);
  }
}

Home.prototype.config.$inject = ['$stateProvider'];
