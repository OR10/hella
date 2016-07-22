import projectListTemplate from './ProjectListDirective.html!';
import ProjectListController from './ProjectListController';

/**
 * Directive to display a List of all {@link Project}s currently available in the backend
 *
 * The directive retrieves the list automatically from the backend.
 */
class ProjectListDirective {
  constructor() {
    this.scope = {
      projectStatus: '@',
      user: '=',
      userPermissions: '=',
    };

    this.template = projectListTemplate;

    this.controller = ProjectListController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}


export default ProjectListDirective;
