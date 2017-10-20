class PaginationControlsController {
  constructor() {
    this._paginationTableController = null;
    this.currentPage = 1;
  }

  jumpToPage(page) {
    this._paginationTableController.triggerPageUpdate(page);
  }

  isPageActive(page) {
    return this._paginationTableController.isPageActive(page);
  }

  _setPaginationTableController(paginationTableController) {
    this._paginationTableController = paginationTableController;

    this._paginationTableController._$scope.$watchGroup(
      ['vm.totalRows', 'vm.itemsPerPage'],
      ([totalRows, itemsPerPage]) => {
        this.totalRows = totalRows;
        this.itemsPerPage = itemsPerPage;

        const pageCount = Math.ceil(this.totalRows / this.itemsPerPage);

        this.pages = [];
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
          this.pages.push(pageIndex + 1);
        }
      }
    );
  }
}

PaginationControlsController.$inject = [];

export default PaginationControlsController;
