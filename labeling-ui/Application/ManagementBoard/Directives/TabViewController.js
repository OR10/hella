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
      const tapToActivate = this.tabs.find(tab => tab.header === newValue);
      if (tapToActivate !== undefined && tapToActivate !== null) {
        this.activateTab(tapToActivate);
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

    // Automatically activate first tab
    if (this.tabs.length === 1) {
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
