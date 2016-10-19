/**
 * Controller of the {@link TitleBarDirective}
 */
class TitleBarController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$state} $state
   * @param {$interval} $interval
   * @param {SystemGateway} systemGateway
   */
  constructor($rootScope, $state, $interval, systemGateway) {
    /**
     * @param {angular.$state} $state
     */
    this.$state = $state;

    /**
     * @type {SystemGateway}
     * @private
     */
    this._systemGateway = systemGateway;

    /**
     * @type {boolean}
     */
    this.isSystemHealthy = true;

    /**
     * @type {number}
     */
    const intervalInSeconds = 10;

    const intervalPromise = $interval(() => {
      this.updateHealthStatus();
    }, 1000 * intervalInSeconds);

    $rootScope.$on('$stateChangeStart',
      () => {
        $interval.cancel(intervalPromise);
      });

    // Initial loading
    this.updateHealthStatus();
  }

  updateHealthStatus() {
    // this._systemGateway.isSystemHealthy().then(healthy => {
    //   this.isSystemHealthy = healthy;
    // });
  }

  handleBackButton() {
    this.$state.go(this.backLink);
  }
}

TitleBarController.$inject = [
  '$rootScope',
  '$state',
  '$interval',
  'systemGateway',
];

export default TitleBarController;
