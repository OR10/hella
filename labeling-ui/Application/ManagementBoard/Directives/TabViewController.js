/**
 * Controller of the {@link TabViewDirective}
 */
class TabViewController {
  constructor($scope) {
    /**
     * List of all registered tabs
     *
     * Tabs will auto-register themselves during $compile.
     *
     * @type {Array.<TabController>}
     */
    this.tabs = [];

    $scope.$watch('vm.activeIndex', newValue => {
      const tabToActivate = this.tabs.find(tab => tab.header === newValue);
      if (tabToActivate !== undefined && tabToActivate !== null) {
        this.activateTab(tabToActivate);
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

    // Automatically activate first tab and when activeIndex is not set
    if (this.tabs.length === 1 && this.activeIndex === undefined) {
      tab.activate();
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
  }
}

TabViewController.$inject = ['$scope'];

export default TabViewController;
