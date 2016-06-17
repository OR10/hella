import Module from 'Application/Module';
import TaskListDirective from './Directives/TaskListDirective';
import ProjectSelectorDirective from './Directives/ProjectSelectorDirective';
import TitleBarDirective from '../Header/Directives/TitleBarDirective';
import HomeController from './Controllers/HomeController';
import homeTemplate from './Views/home.html!';
import UnassignedTasksFilterProvider from './Filters/UnassignesTasksFilterProvider';
import MyTasksFilterProvider from './Filters/MyTasksFilterProvider';
import OtherPeopleTasksFilterProvider from './Filters/OtherPeopleTasksFilterProvider';
import ProjectFilterProvider from './Filters/ProjectFilterProvider';

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
      url: 'tasks?project',
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
    this.registerDirective('taskList', TaskListDirective);
    this.registerDirective('projectSelector', ProjectSelectorDirective);
    this.registerDirective('titleBar', TitleBarDirective);
    this.module.filter('unassignedTasks', UnassignedTasksFilterProvider);
    this.module.filter('myTasks', MyTasksFilterProvider);
    this.module.filter('otherPeopleTasks', OtherPeopleTasksFilterProvider);
    this.module.filter('project', ProjectFilterProvider);
  }
}

Home.prototype.config.$inject = ['$stateProvider'];

export default Home;
