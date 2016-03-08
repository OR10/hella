import exportListTemplate from './ExportListDirective.html!';
import ExportListController from './ExportListController';

/**
 * Directive to display a List of all {@link Export}s currently available for the given {@link Task}
 *
 * The directive retrieves the list automatically from the backend.
 */
class ExportListDirective {
  constructor() {
    this.template = exportListTemplate;

    this.controller = ExportListController;
    this.controllerAs = 'vm';
    this.bindToController = true;

    this.scope = {
      exports: '=',
    };
  }
}

export default ExportListDirective;
