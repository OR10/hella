import projectSelectorTemplate from './ProjectSelectorDirective.html!';
import ProjectSelectorController from './ProjectSelectorController';

/**
 * Directive to display a selection of all projects available in the backend, which allows the user to choose one.
 *
 * The directive retrieves the projects automatically from the backend.
 */
class ProjectSelectorDirective {
  constructor() {
    this.scope = {};

    this.template = projectSelectorTemplate;
    this.controller = ProjectSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.require = ['projectSelector', 'ngModel'];
  }

  link(scope, elem, attrs, [projectSelectorController, ngModelController]) {
    projectSelectorController.setNgModelController(ngModelController);
  }
}

export default ProjectSelectorDirective;
