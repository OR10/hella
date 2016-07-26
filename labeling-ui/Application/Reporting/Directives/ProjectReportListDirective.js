import projectReportListTemplate from './ProjectReportListDirective.html!';
import ProjectReportListController from './ProjectReportListController';

/**
 * Directive to display a List of all {@link Report}s currently available for the given {@link Project}
 *
 * The directive retrieves the list automatically from the backend.
 */
class ProjectReportListDirective {
  constructor() {
    this.template = projectReportListTemplate;

    this.controller = ProjectReportListController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.scope = {
      reports: '=',
    };
  }
}

export default ProjectReportListDirective;
