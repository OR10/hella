class PaginationTableController {
  constructor($scope) {
    this._$scope = $scope;

    this._triggerPageUpdate(1);
  }

  _triggerPageUpdate(page) {
    this.onPageUpdate({
      itemsPerPage: parseInt(this.itemsPerPage, 10),
      totalRows: parseInt(this.totalRows, 10),
      page,
    });
  }
}

PaginationTableController.$inject = [
  '$scope',
];

export default PaginationTableController;
