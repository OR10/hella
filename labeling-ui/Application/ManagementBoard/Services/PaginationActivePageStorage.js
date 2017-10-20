class PaginationActivePageStorage {
  /**
   * @param {LoggerService} loggerService
   */
  constructor(loggerService) {
    /**
     * Map holding stored page information values for a given identifier.
     *
     * @type {Map}
     * @private
     */
    this._storage = new Map();

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = loggerService;
  }

  /**
   * @param {string} identifier
   * @param {number} itemsPerPage
   * @param {number} totalRows
   * @param {number} page
   */
  storeActivePage(identifier, itemsPerPage, totalRows, page) {
    const storedInformation = {itemsPerPage, totalRows, page};
    this._storage.set(identifier, storedInformation);

    this._logger.log(
      'paginationActivePageStorage:store',
      `Stored active page for identifier ${identifier}:`,
      storedInformation
    );
  }

  /**
   * @param {string} identifier
   * @returns {{itemsPerPage: number, totalRows: number, page: number}|undefined}
   */
  retrieveActivePage(identifier) {
    return this._storage.get(identifier);
  }
}

PaginationActivePageStorage.$inject = [
  'loggerService',
];

export default PaginationActivePageStorage;
