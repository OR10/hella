class PaginationTableController {
  constructor($scope) {
    this._$scope = $scope;

    this._triggerPageUpdate(1);
    /**
     * @type {number}
     * @private
     */
    this._activePage = 1;
  }

  _triggerPageUpdate(page) {
    this.onPageUpdate({
      itemsPerPage: parseInt(this.itemsPerPage, 10),
      totalRows: parseInt(this.totalRows, 10),
      page,
    });

    this._activePage = page;
  /**
   * @param {number} page
   * @returns {boolean}
   */
  isPageActive(page) {
    return page === this._activePage;
  }

  }
}

PaginationTableController.$inject = [
  '$scope',
];

export default PaginationTableController;
