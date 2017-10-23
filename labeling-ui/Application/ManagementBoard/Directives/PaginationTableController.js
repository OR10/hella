class PaginationTableController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {PaginationActivePageStorage} paginationActivePageStorage
   */
  constructor($scope, paginationActivePageStorage) {
    /**
     * @type {$rootScope.$scope}
     * @private
     */
    this._$scope = $scope;

    /**
     * @type {PaginationActivePageStorage}
     * @private
     */
    this._activePageStorage = paginationActivePageStorage;

    /**
     * @type {number}
     * @private
     */
    this._activePage = 1;

    this.triggerPageUpdate(
      this._retrieveActivePage()
    );
  }

  /**
   * @param {number} page
   */
  triggerPageUpdate(page) {
    const itemsPerPage = parseInt(this.itemsPerPage, 10);
    const totalRows = parseInt(this.totalRows, 10);

    this._activePage = page;

    this.onPageUpdate({itemsPerPage, totalRows, page});

    this._storeActivePage(itemsPerPage, totalRows, page);
  }

  /**
   * @param {number} page
   * @returns {boolean}
   */
  isPageActive(page) {
    return page === this._activePage;
  }

  /**
   * If enabled store the given information in the active page storage
   *
   * @param {number} itemsPerPage
   * @param {number} totalRows
   * @param {number} page
   * @private
   */
  _storeActivePage(itemsPerPage, totalRows, page) {
    if (this.storageIdentifier === undefined) {
      return;
    }

    this._activePageStorage.storeActivePage(
      this.storageIdentifier,
      itemsPerPage,
      totalRows,
      page
    );
  }

  /**
   * Retrieve the active page, if it has been stored before, matches the identifier of this component and
   * its other parameters
   *
   * @returns {number}
   * @private
   */
  _retrieveActivePage() {
    const defaultPage = 1;

    if (this.storageIdentifier === undefined) {
      return defaultPage;
    }

    const storedInformation = this._activePageStorage.retrieveActivePage(this.storageIdentifier);
    if (storedInformation === undefined) {
      return defaultPage;
    }

    const itemsPerPage = parseInt(this.itemsPerPage, 10);

    if (storedInformation.itemsPerPage !== itemsPerPage) {
      return defaultPage;
    }

    return storedInformation.page;
  }
}

PaginationTableController.$inject = [
  '$scope',
  'paginationActivePageStorage',
];

export default PaginationTableController;
