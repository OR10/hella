/**
 * ManagementBoard Module
 *
 * This module contains all necessary modules directly involved in providing the initial application entry point.
 *
 * @extends Module
 */
import Module from 'Application/Module';

import TabViewDirective from './Directives/TabViewDirective';
import TabDirective from './Directives/TabDirective';

import PaginationTableDirective from './Directives/PaginationTableDirective';
import PaginationControlsDirective from './Directives/PaginationControlsDirective';

import BackLinkDirective from './Directives/BackLinkDirective';

import UploadView from './Views/UploadView.html!';

import ProjectsController from './Controllers/ProjectsController';
import ProjectsView from './Views/ProjectsView.html!';
import ProjectCreateController from './Controllers/ProjectCreateController';
import ProjectCreateView from './Views/ProjectCreateView.html!';
import ProjectGateway from './Gateways/ProjectGateway';
import ProjectListDirective from './Directives/ProjectListDirective';
import ProjectFlaggedController from './Controllers/ProjectFlaggedController';
import ProjectFlaggedView from './Views/ProjectFlaggedView.html!';

import TasksController from './Controllers/TasksController';
import TasksView from './Views/TasksView.html!';
import TaskListDirective from './Directives/TaskListDirective';
import FlaggedTaskListDirective from './Directives/FlaggedTaskListDirective';
import UploadGateway from './Gateways/UploadGateway';
import UploadController from './Controllers/UploadController';
import UploadFormDirective from './Directives/UploadFormDirective';

import UsersController from './Controllers/UsersController';
import UsersView from './Views/UsersView.html!';
import UserGateway from './Gateways/UserGateway';
import UsersListDirective from './Directives/UsersListDirective';
import UserProfileDirective from './Directives/UserProfileDirective';

import LabelingGroupsController from './Controllers/LabelingGroupsController';
import LabelingGroupsView from './Views/LabelingGroupsView.html!';
import LabelingGroupGateway from './Gateways/LabelingGroupGateway';
import LabelingGroupListDirective from './Directives/LabelingGroupListDirective';
import LabelingGroupsDetailDirective from './Directives/LabelingGroupsDetailDirective';

import TaskConfigurationGateway from './Gateways/TaskConfigurationGateway';
import TaskConfigurationUploadController from './Controllers/TaskConfigurationUploadController';
import TaskConfigurationUploadView from './Views/TaskConfigurationUploadView.html!';

import SingleRoleFilterProvider from './Filters/SingleRoleFilterProvider';
import ReadableRoleFilterProvider from './Filters/ReadableRoleFilterProvider';
import FileSizeFilterProvider from './Filters/FileSizeFilterProvider';
import IsArrayProvider from './Filters/IsArrayProvider';

import SystemStatusController from './Controllers/SystemStatusController';
import SystemStatusView from './Views/SystemStatusView.html!';
import SystemGateway from './Gateways/SystemGateway';

class ManagementBoard extends Module {
  /**
   * @inheritDoc
   * @param {angular.$stateProvider} $stateProvider
   */
  config($stateProvider) {
    $stateProvider.state('labeling.upload', {
      url: 'upload/:projectId',
      parent: 'organisation',
      views: {
        '@organisation': {
          controller: UploadController,
          controllerAs: 'vm',
          template: UploadView,
        },
      },
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          'organisationService',
          ($stateParams, projectGateway, organisationService) => {
            organisationService.set($stateParams.organisationId);
            return projectGateway.getProject($stateParams.projectId);
          },
        ],
      },
    });

    $stateProvider.state('labeling.projects', {
      url: 'projects',
      parent: 'organisation',
      redirectTo: 'labeling.projects.list',
    });

    $stateProvider.state('labeling.projects.list', {
      url: '/',
      views: {
        '@organisation': {
          controller: ProjectsController,
          controllerAs: 'vm',
          template: ProjectsView,
        },
      },
    });

    $stateProvider.state('labeling.projects.create', {
      url: '/create',
      views: {
        '@organisation': {
          controller: ProjectCreateController,
          controllerAs: 'vm',
          template: ProjectCreateView,
        },
      },
    });

    $stateProvider.state('labeling.projects.flagged', {
      url: '/:projectId/flagged',
      views: {
        '@organisation': {
          controller: ProjectFlaggedController,
          controllerAs: 'vm',
          template: ProjectFlaggedView,
        },
      },
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          'organisationService',
          ($stateParams, projectGateway, organisationService) => {
            organisationService.set($stateParams.organisationId);
            return projectGateway.getProject($stateParams.projectId);
          },
        ],
      },
    });

    $stateProvider.state('labeling.tasks', {
      url: 'projects/:projectId/tasks',
      parent: 'organisation',
      redirectTo: 'labeling.tasks.list',
    });

    $stateProvider.state('labeling.tasks.list', {
      url: '/',
      views: {
        '@organisation': {
          controller: TasksController,
          controllerAs: 'vm',
          template: TasksView,
        },
      },
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          'organisationService',
          ($stateParams, projectGateway, organisationService) => {
            organisationService.set($stateParams.organisationId);
            return projectGateway.getProject($stateParams.projectId);
          },
        ],
      },
    });

    $stateProvider.state('labeling.users', {
      url: 'users',
      parent: 'organisation',
      redirectTo: 'labeling.users.list',
    });

    $stateProvider.state('labeling.users.list', {
      url: '/',
      views: {
        '@organisation': {
          controller: UsersController,
          controllerAs: 'vm',
          template: UsersView,
        },
      },
    });

    $stateProvider.state('labeling.users.detail', {
      url: '/{userId:[0-9a-f]{1,32}|new}',
      views: {
        '@organisation': {
          controller: UsersController,
          controllerAs: 'vm',
          template: UsersView,
        },
      },
    });

    $stateProvider.state('labeling.labeling-groups', {
      url: 'labelingGroups',
      parent: 'organisation',
      redirectTo: 'labeling.labeling-groups.list',
    });

    $stateProvider.state('labeling.labeling-groups.list', {
      url: '/',
      views: {
        '@organisation': {
          controller: LabelingGroupsController,
          controllerAs: 'vm',
          template: LabelingGroupsView,
        },
      },
    });

    $stateProvider.state('labeling.labeling-groups.detail', {
      url: '/:groupId',
      views: {
        '@organisation': {
          controller: LabelingGroupsController,
          controllerAs: 'vm',
          template: LabelingGroupsView,
        },
      },
    });

    $stateProvider.state('labeling.task-configurations', {
      url: 'taskConfigurations',
      parent: 'organisation',
      redirectTo: 'labeling.task.configurations.list',
    });

    $stateProvider.state('labeling.task-configurations.upload', {
      url: '/upload',
      views: {
        '@organisation': {
          controller: TaskConfigurationUploadController,
          controllerAs: 'vm',
          template: TaskConfigurationUploadView,
        },
      },
    });

    $stateProvider.state('labeling.system', {
      url: 'system',
      redirectTo: 'labeling.system.status',
    });

    $stateProvider.state('labeling.system.status', {
      url: '/status',
      views: {
        '@labeling': {
          controller: SystemStatusController,
          controllerAs: 'vm',
          template: SystemStatusView,
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
    this.module.service('labelingGroupGateway', LabelingGroupGateway);
    this.module.service('taskConfigurationGateway', TaskConfigurationGateway);
    this.module.service('projectGateway', ProjectGateway);
    this.module.service('systemGateway', SystemGateway);
    this.module.service('uploadGateway', UploadGateway);

    this.registerDirective('backLink', BackLinkDirective);
    this.registerDirective('tabView', TabViewDirective);
    this.registerDirective('tab', TabDirective);
    this.registerDirective('paginationTable', PaginationTableDirective);
    this.registerDirective('paginationControls', PaginationControlsDirective);
    this.registerDirective('projectList', ProjectListDirective);
    this.registerDirective('taskList', TaskListDirective);
    this.registerDirective('usersList', UsersListDirective);
    this.registerDirective('userProfile', UserProfileDirective);
    this.registerDirective('labelingGroupList', LabelingGroupListDirective);
    this.registerDirective('labelingGroupDetail', LabelingGroupsDetailDirective);
    this.registerDirective('flaggedTaskList', FlaggedTaskListDirective);
    this.registerDirective('uploadForm', UploadFormDirective);

    this.module.filter('singleRole', SingleRoleFilterProvider);
    this.module.filter('readableRole', ReadableRoleFilterProvider);
    this.module.filter('fileSize', FileSizeFilterProvider);
    this.module.filter('isArray', IsArrayProvider);
  }
}

ManagementBoard.prototype.config.$inject = ['$stateProvider'];

export default ManagementBoard;
