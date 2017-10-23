import PaginationTableController from './PaginationTableController';

class PaginationTableDirective {
  constructor() {
    this.restrict = 'A';
    this.scope = {
      totalRows: '=',
      itemsPerPage: '@',
      onPageUpdate: '&',
      storageIdentifier: '@?',
    };

    this.controller = PaginationTableController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default PaginationTableDirective;
