/**
 * Controller of the {@link TabDirective}
 */
class TabController {
  constructor() {
    /**
     * Parent {@link TabViewController}
     *
     * Will be injected via {@link TabController#_setTabViewController}
     *
     * @type {TabViewController|null}
     * @private
     */
    this._tabViewController = null;

    /**
     * Flag indicating whether the tab is active (visible) or not
     *
     * @type {boolean}
     */
    this.active = false;

    /**
     * Flag indicating if the next activation is the first view of the tab
     *
     * @type {boolean}
     */
    this.firstView = true;
  }

  /**
   * Inject the parent {@link TabViewController}
   *
   * @param {TabViewController} tabViewController
   */
  _setTabViewController(tabViewController) {
    this._tabViewController = tabViewController;

    // Register with the TabViewController
    this._tabViewController.registerTab(this);
  }

  activate() {
    const oldActive = this.active;

    this.active = true;

    if (oldActive === false && this.onActivate !== undefined) {
      this.onActivate({tab: this});
    }
  }

  deactivate() {
    const oldActive = this.active;

    this.active = false;

    if (oldActive === true) {
      // Deactivate firstView on first deactivation.
      this.firstView = false;

      if (this.onDeactivate !== undefined) {
        this.onDeactivate({tab: this});
      }
    }
  }
}

TabController.$inject = [];

export default TabController;
