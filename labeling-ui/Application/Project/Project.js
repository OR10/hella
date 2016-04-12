import Module from 'Application/Module';
import ProjectController from './Controller/ProjectController';
import ProjectGateway from './Gateways/ProjectGateway';
import ProjectListDirective from './Directives/ProjectListDirective';
import projectTemplate from './Views/project.html!';

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
    function projectResolver(projectGateway) {
      return projectGateway.getProjects();
    }

    projectResolver.$inject = ['projectGateway'];

    $stateProvider.state('labeling.projects', {
      url: 'projects',
      controller: ProjectController,
      controllerAs: 'vm',
      template: projectTemplate,
      resolve: {
        projects: projectResolver,
      },
    });
  }

  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Projects', []);
    this.module.service('projectGateway', ProjectGateway);
    this.registerDirective('projectsList', ProjectListDirective);
  }
}

Project.prototype.config.$inject = ['$stateProvider'];

export default Project;