import Module from 'Application/Module';
import ProjectController from './Controller/ProjectController';
import ProjectExportController from './Controller/ProjectExportController';
import ProjectGateway from './Gateways/ProjectGateway';
import ProjectListDirective from './Directives/ProjectListDirective';
import ProjectExportListDirective from './Directives/ProjectExportListDirective';
import projectTemplate from './Views/project.html!';
import projectExportTemplate from './Views/projectExport.html!';

/**
 * Project Module
 *
 * This module contains all necessary modules directly involved in project data.
 *
 * @extends Module
 */
class Project extends Module {
  /**
   * @inheritDoc
   * @param $stateProvider
   */
  config($stateProvider) {
    function projectsResolver(projectGateway) {
      return projectGateway.getDetailedProjects();
    }

    projectsResolver.$inject = ['projectGateway'];

    function projectResolver($stateParams, projectGateway) {
      return projectGateway.getProject($stateParams.projectId);
    }

    projectResolver.$inject = ['$stateParams', 'projectGateway'];

    $stateProvider.state('labeling.projects', {
      url: 'projects',
      controller: ProjectController,
      controllerAs: 'vm',
      template: projectTemplate,
      resolve: {
        projects: projectsResolver,
      },
    });

    $stateProvider.state('labeling.projects.export', {
      url: '/:projectId/export',
      views: {
        '@labeling': {
          controller: ProjectExportController,
          controllerAs: 'vm',
          template: projectExportTemplate,
          resolve: {
            project: projectResolver,
          },
        },
      },
    });
  }

  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Projects', []);
    this.module.service('projectGateway', ProjectGateway);
    this.registerDirective('projectsList', ProjectListDirective);
    this.registerDirective('projectsExportList', ProjectExportListDirective);
  }
}

Project.prototype.config.$inject = ['$stateProvider'];

export default Project;