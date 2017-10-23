class TabViewActiveIndexStorage {
  /**
   * @param {LoggerService} loggerService
   */
  constructor(loggerService) {
    /**
     * Map holding a `TabView` instance to index association.
     *
     * @type {Map}
     * @private
     */
    this._indexMap = new Map();

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = loggerService;
  }

  /**
   * @param {string} tabViewIdentifier
   * @param {number} index
   */
  storeActiveIndex(tabViewIdentifier, index) {
    this._indexMap.set(tabViewIdentifier, index);
    this._logger.log('tabViewActiveIndexStorage:save', 'Stored active Index:', tabViewIdentifier, index);
  }

  /**
   * @param {string} tabViewIdentifier
   * @returns {number|undefined}
   */
  retrieveActiveIndex(tabViewIdentifier) {
    const loadedIndex = this._indexMap.get(tabViewIdentifier);
    this._logger.log('tabViewActiveIndexStorage:load', 'Loaded active Index:', tabViewIdentifier, loadedIndex);
    return loadedIndex;
  }

  /**
   * @param {string} tabViewIdentifier
   * @results {boolean}
   */
  clearActiveIndex(tabViewIdentifier) {
    this._logger.log('tabViewActiveIndexStorage:clear', 'Cleared active Index:', tabViewIdentifier);
    return this._indexMap.delete(tabViewIdentifier);
  }
}

TabViewActiveIndexStorage.$inject = [
  'loggerService',
];

export default TabViewActiveIndexStorage;
