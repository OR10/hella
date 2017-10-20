/**
 * Controller of the {@link TabViewDirective}
 */
class TabViewController {
  /**
   * @param {$rootScope.$scope} $scope
   * @param {TabViewActiveIndexStorage} tabViewActiveIndexStorage
   */
  constructor($scope, tabViewActiveIndexStorage) {
    /**
     * List of all registered tabs
     *
     * Tabs will auto-register themselves during $compile.
     *
     * @type {Array.<TabController>}
     */
    this.tabs = [];

    /**
     * @type {TabViewActiveIndexStorage}
     * @private
     */
    this._activeIndexStorage = tabViewActiveIndexStorage;

    $scope.$watch('vm.activeIndex', newValue => {
      const tabToActivate = this.tabs.find((tab, index) => index === newValue);
      if (tabToActivate !== undefined && tabToActivate !== null) {
        this.activateTab(tabToActivate);
      }

      if (newValue !== undefined) {
        this._saveStoredIndex(newValue);
      }
    });
  }

  /**
   * Register a new tab with the TabView
   *
   * Automatically invoked during $compile by TabDirectives
   *
   * @param {TabController} tab
   */
  registerTab(tab) {
    this.tabs.push(tab);

    // Automatically activate first tab or stored tab if activeIndex is not set
    if (this.tabs.length > 0 && this.activeIndex === undefined) {
      const storedIndex = this._retrieveStoredIndex();
      if (storedIndex !== undefined) {
        if (storedIndex === this.tabs.length - 1) {
          tab.activate();
        }
      } else {
        if (this.tabs.length === 1) {
          tab.activate();
        }
      }
    }
  }

  /**
   * Activate a specifically selected tab
   *
   * @param {TabController} tabToActivate
   */
  activateTab(tabToActivate) {
    this.tabs.forEach(tab => tab.deactivate());
    tabToActivate.activate();

    this.activeIndex = this.tabs.findIndex(
      candidate => candidate === tabToActivate
    );
  }

  /**
   * @param {number} index
   * @private
   */
  _saveStoredIndex(index) {
    if (this.storageIdentifier !== undefined) {
      this._activeIndexStorage.storeActiveIndex(this.storageIdentifier, index);
    }
  }

  /**
   * @returns {number|undefined}
   * @private
   */
  _retrieveStoredIndex() {
    if (this.storageIdentifier === undefined) {
      return undefined;
    }

    return this._activeIndexStorage.retrieveActiveIndex(this.storageIdentifier);
  }
}

TabViewController.$inject = [
  '$scope',
  'tabViewActiveIndexStorage',
];

export default TabViewController;
