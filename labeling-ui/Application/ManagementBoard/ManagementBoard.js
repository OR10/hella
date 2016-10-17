import Module from 'Application/Module';

import TabViewDirective from './Directives/TabViewDirective';
import TabDirective from './Directives/TabDirective';

import PaginationTableDirective from './Directives/PaginationTableDirective';
import PaginationControlsDirective from './Directives/PaginationControlsDirective';

import TitleBarDirective from './Directives/TitleBarDirective';

import UploadController from './Controllers/UploadController';
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

import UsersController from './Controllers/UsersController';
import UsersView from './Views/UsersView.html!';
import UsersDetailController from './Controllers/UsersDetailController';
import UsersDetailView from './Views/UsersDetailView.html!';
import UserGateway from './Gateways/UserGateway';
import UsersListDirective from './Directives/UsersListDirective';
import UserProfileDirective from './Directives/UserProfileDirective';

import LabelingGroupsController from './Controllers/LabelingGroupsController';
import LabelingGroupsView from './Views/LabelingGroupsView.html!';
import LabelingGroupsDetailController from './Controllers/LabelingGroupsDetailController';
import LabelingGroupsDetailView from './Views/LabelingGroupsDetailView.html!';
import LabelingGroupGateway from './Gateways/LabelingGroupGateway';
import LabelingGroupListDirective from './Directives/LabelingGroupListDirective';

import TaskConfigurationGateway from './Gateways/TaskConfigurationGateway';
import TaskConfigurationController from './Controllers/TaskConfigurationController';
import TaskConfigurationView from './Views/TaskConfigurationView.html!';
import TaskConfigurationUploadController from './Controllers/TaskConfigurationUploadController';
import TaskConfigurationUploadView from './Views/TaskConfigurationUploadView.html!';

import SingleRoleFilterProvider from './Filters/SingleRoleFilterProvider';
import ReadableRoleFilterProvider from './Filters/ReadableRoleFilterProvider';
import FileSizeFilterProvider from './Filters/FileSizeFilterProvider';


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
    $stateProvider.state('labeling.upload', {
      url: 'upload/:projectId',
      views: {
        '@': {
          controller: UploadController,
          controllerAs: 'vm',
          template: UploadView,
        },
      },
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          ($stateParams, projectGateway) => projectGateway.getProject($stateParams.projectId),
        ],
      },
    });

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

    $stateProvider.state('labeling.projects.create', {
      url: '/create',
      views: {
        '@': {
          controller: ProjectCreateController,
          controllerAs: 'vm',
          template: ProjectCreateView,
        },
      },
    });

    $stateProvider.state('labeling.projects.flagged', {
      url: '/:projectId/flagged',
      views: {
        '@': {
          controller: ProjectFlaggedController,
          controllerAs: 'vm',
          template: ProjectFlaggedView,
        },
      },
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          ($stateParams, projectGateway) => projectGateway.getProject($stateParams.projectId),
        ],
      },
    });

    $stateProvider.state('labeling.tasks', {
      url: 'projects/:projectId/tasks',
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
      resolve: {
        project: [
          '$stateParams',
          'projectGateway',
          ($stateParams, projectGateway) => projectGateway.getProject($stateParams.projectId),
        ],
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
      url: '/{userId:[0-9a-f]{1,32}|new}',
      views: {
        '@': {
          controller: UsersDetailController,
          controllerAs: 'vm',
          template: UsersDetailView,
        },
      },
    });

    $stateProvider.state('labeling.labeling-groups', {
      url: 'labelingGroups',
      redirectTo: 'labeling.labeling-groups.list',
    });

    $stateProvider.state('labeling.labeling-groups.list', {
      url: '/',
      views: {
        '@': {
          controller: LabelingGroupsController,
          controllerAs: 'vm',
          template: LabelingGroupsView,
        },
      },
    });

    $stateProvider.state('labeling.labeling-groups.detail', {
      url: '/:groupId',
      views: {
        '@': {
          controller: LabelingGroupsDetailController,
          controllerAs: 'vm',
          template: LabelingGroupsDetailView,
        },
      },
    });

    $stateProvider.state('labeling.task-configurations', {
      url: 'taskConfigurations',
      redirectTo: 'labeling.task.configurations.list',
    });

    $stateProvider.state('labeling.task-configurations.list', {
      url: '/',
      views: {
        '@': {
          controller: TaskConfigurationController,
          controllerAs: 'vm',
          template: TaskConfigurationView,
        },
      },
    });

    $stateProvider.state('labeling.task-configurations.upload', {
      url: '/upload',
      views: {
        '@': {
          controller: TaskConfigurationUploadController,
          controllerAs: 'vm',
          template: TaskConfigurationUploadView,
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

    this.registerDirective('titleBar', TitleBarDirective);
    this.registerDirective('tabView', TabViewDirective);
    this.registerDirective('tab', TabDirective);
    this.registerDirective('paginationTable', PaginationTableDirective);
    this.registerDirective('paginationControls', PaginationControlsDirective);
    this.registerDirective('projectList', ProjectListDirective);
    this.registerDirective('taskList', TaskListDirective);
    this.registerDirective('usersList', UsersListDirective);
    this.registerDirective('userProfile', UserProfileDirective);
    this.registerDirective('labelingGroupList', LabelingGroupListDirective);
    this.registerDirective('flaggedTaskList', FlaggedTaskListDirective);

    this.module.filter('singleRole', SingleRoleFilterProvider);
    this.module.filter('readableRole', ReadableRoleFilterProvider);
    this.module.filter('fileSize', FileSizeFilterProvider);
  }
}

ManagementBoard.prototype.config.$inject = ['$stateProvider'];

export default ManagementBoard;
