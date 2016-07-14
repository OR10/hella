import Module from 'Application/Module';

import TitleBarDirective from './Directives/TitleBarDirective';

import ProjectsController from './Controllers/ProjectsController';
import ProjectsView from './Views/ProjectsView.html!';

import TasksController from './Controllers/TasksController';
import TasksView from './Views/TasksView.html!';
import TaskListDirective from './Directives/TaskListDirective';
import UnassignedTasksFilterProvider from './Filters/UnassignesTasksFilterProvider';
import MyTasksFilterProvider from './Filters/MyTasksFilterProvider';
import OtherPeopleTasksFilterProvider from './Filters/OtherPeopleTasksFilterProvider';
import ProjectFilterProvider from './Filters/ProjectFilterProvider';

import UsersController from './Controllers/UsersController';
import UsersView from './Views/UsersView.html!';
import UsersDetailController from './Controllers/UsersDetailController';
import UsersDetailView from './Views/UsersDetailView.html!';
import UserGateway from './Gateways/UserGateway';
import UsersListDirective from './Directives/UsersListDirective';
import UserProfileDirective from './Directives/UserProfileDirective';

import SingleRoleFilterProvider from './Filters/SingleRoleFilterProvider';
import ReadableRoleFilterProvider from './Filters/ReadableRoleFilterProvider';

/**
 * ManagementBoard Module
 *
 * This module contains all necessary modules directly involved in providing the initial application entry point.
 *
 * @extends Module
 */
class ManagementBoard extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    $stateProvider.state('labeling.projects', {
      url: 'projects',
      template: '<ui-view class="grid-block"/>',
      redirectTo: 'labeling.projects.list',
    });

    $stateProvider.state('labeling.projects.list', {
      url: '/',
      controller: ProjectsController,
      controllerAs: 'vm',
      template: ProjectsView,
    });

    $stateProvider.state('labeling.tasks', {
      url: 'projects/:projectId/tasks',
      template: '<ui-view class="grid-block"/>',
      redirectTo: 'labeling.tasks.list',
    });

    $stateProvider.state('labeling.tasks.list', {
      url: '/',
      controller: TasksController,
      controllerAs: 'vm',
      template: TasksView,
    });

    $stateProvider.state('labeling.users', {
      url: 'users',
      template: '<ui-view class="grid-block"/>',
      redirectTo: 'labeling.users.list',
    });

    $stateProvider.state('labeling.users.list', {
      url: '/',
      controller: UsersController,
      controllerAs: 'vm',
      template: UsersView,
    });

    $stateProvider.state('labeling.users.detail', {
      url: '/:userId',
      controller: UsersDetailController,
      controllerAs: 'vm',
      template: UsersDetailView,
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.ManagementBoard', []);

    this.module.service('userGateway', UserGateway);

    this.registerDirective('titleBar', TitleBarDirective);
    this.registerDirective('taskList', TaskListDirective);
    this.registerDirective('usersList', UsersListDirective);
    this.registerDirective('userProfile', UserProfileDirective);

    this.module.filter('unassignedTasks', UnassignedTasksFilterProvider);
    this.module.filter('myTasks', MyTasksFilterProvider);
    this.module.filter('otherPeopleTasks', OtherPeopleTasksFilterProvider);
    this.module.filter('project', ProjectFilterProvider);
    this.module.filter('singleRole', SingleRoleFilterProvider);
    this.module.filter('readableRole', ReadableRoleFilterProvider);

  }
}

ManagementBoard.prototype.config.$inject = ['$stateProvider'];

export default ManagementBoard;
