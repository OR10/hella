import ProjectListController from './ProjectListController';
import projectListTemplate from './ProjectList.html!';

/**
 * Directive for listing the provided projects
 */
class ProjectListDirective {
  constructor() {
    this.scope = {
      projects: '=',
    };
    this.controller = ProjectListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.template = projectListTemplate;
  }
}

export default ProjectListDirective;