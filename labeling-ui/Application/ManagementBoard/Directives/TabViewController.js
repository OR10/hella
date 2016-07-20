/**
 * Controller of the {@link TabViewDirective}
 */
class TabViewController {
  constructor() {
    /**
     * List of all registered tabs
     *
     * Tabs will auto-register themselves during $compile.
     *
     * @type {Array.<TabController>}
     */
    this.tabs = [];
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

TabViewController.$inject = [];

export default TabViewController;
