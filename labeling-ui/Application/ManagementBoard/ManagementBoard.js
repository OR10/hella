import Module from 'Application/Module';

import TabViewDirective from './Directives/TabViewDirective';
import TabDirective from './Directives/TabDirective';

import TitleBarDirective from './Directives/TitleBarDirective';

import ProjectsController from './Controllers/ProjectsController';
import ProjectsView from './Views/ProjectsView.html!';
import ProjectGateway from './Gateways/ProjectGateway';
import ProjectListLazyStoreService from './Services/ProjectListLazyStoreService';
import ProjectListDirective from './Directives/ProjectListDirective';

import TasksController from './Controllers/TasksController';
import TasksView from './Views/TasksView.html!';
import TaskListDirective from './Directives/TaskListDirective';

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
      redirectTo: 'labeling.projects.list',
    });

    $stateProvider.state('labeling.projects.list', {
      url: '/',
      views: {
        '@': {
          controller: ProjectsController,
          controllerAs: 'vm',
          template: ProjectsView,
        },
      },
    });

    $stateProvider.state('labeling.tasks', {
      url: 'projects/{projectId:[a-f0-9]{32}}/tasks',
      redirectTo: 'labeling.tasks.list',
    });

    $stateProvider.state('labeling.tasks.list', {
      url: '/',
      views: {
        '@': {
          controller: TasksController,
          controllerAs: 'vm',
          template: TasksView,
        },
      },
    });

    $stateProvider.state('labeling.users', {
      url: 'users',
      redirectTo: 'labeling.users.list',
    });

    $stateProvider.state('labeling.users.list', {
      url: '/',
      views: {
        '@': {
          controller: UsersController,
          controllerAs: 'vm',
          template: UsersView,
        },
      },
    });

    $stateProvider.state('labeling.users.detail', {
      url: '/{userId:[0-9a-f]{1,32}}',
      views: {
        '@': {
          controller: UsersDetailController,
          controllerAs: 'vm',
          template: UsersDetailView,
        },
      },
    });
  }

  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.ManagementBoard', []);

    this.module.service('userGateway', UserGateway);
    this.module.service('projectGateway', ProjectGateway);
    this.module.service('projectListLazyStoreService', ProjectListLazyStoreService);

    this.registerDirective('titleBar', TitleBarDirective);
    this.registerDirective('tabView', TabViewDirective);
    this.registerDirective('tab', TabDirective);
    this.registerDirective('projectList', ProjectListDirective);
    this.registerDirective('taskList', TaskListDirective);
    this.registerDirective('usersList', UsersListDirective);
    this.registerDirective('userProfile', UserProfileDirective);

    this.module.filter('singleRole', SingleRoleFilterProvider);
    this.module.filter('readableRole', ReadableRoleFilterProvider);

  }
}

ManagementBoard.prototype.config.$inject = ['$stateProvider'];

export default ManagementBoard;
