import projectExportListTemplate from './ProjectExportListDirective.html!';
import ProjectExportListController from './ProjectExportListController';

/**
 * Directive to display a List of all {@link Export}s currently available for the given {@link Task}
 *
 * The directive retrieves the list automatically from the backend.
 */
class ProjectExportListDirective {
  constructor() {
    this.template = projectExportListTemplate;

    this.controller = ProjectExportListController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.scope = {
      exports: '=',
      project: '=',
    };
  }
}

export default ProjectExportListDirective;
