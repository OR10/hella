import paginationControlsTemplate from './PaginationControlsDirective.html!';
import PaginationControlsController from './PaginationControlsController';

class PaginationControlsDirective {
  constructor() {
    this.scope = {
    };
    this.template = paginationControlsTemplate;
    this.controller = PaginationControlsController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.require = [
      'paginationControls',
      '^paginationTable',
    ];
  }

  link($scope, element, attributes, controllers) {
    // Register with PaginationTable
    const [paginationControlsController, paginationTableController] = controllers;
    paginationControlsController._setPaginationTableController(paginationTableController);
  }
}

export default PaginationControlsDirective;
