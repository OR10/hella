class TabViewActiveIndexStorage {
  constructor() {
    /**
     * Map holding a `TabView` instance to index association.
     *
     * @type {WeakMap}
     * @private
     */
    this._indexMap = new WeakMap();
  }

  /**
   * @param {TabViewController} tabView
   * @param {number} index
   */
  storeActiveIndex(tabView, index) {
    this._indexMap.set(tabView, index);
  }

  /**
   * @param {TabViewController} tabView
   * @returns {number|undefined}
   */
  retrieveActiveIndex(tabView) {
    return this._indexMap.get(tabView);
  }

  /**
   * @param {TabViewController} tabView
   * @results {boolean}
   */
  clearActiveIndex(tabView) {
    return this._indexMap.delete(tabView);
  }
}

TabViewActiveIndexStorage.$inject = [];

export default TabViewActiveIndexStorage;
