/**
 * Controller for the system status route into the application
 */
class SystemStatusController {
  /**
   * @param {$rootScope.$scope} $rootScope
   * @param $interval
   * @param {SystemGateway} systemGateway
   * @param {User} user
   * @param {UserPermissions} userPermissions
   */
  constructor($rootScope, $interval, systemGateway, user, userPermissions) {
    /**
     * @type {SystemGateway}
     * @private
     */
    this._systemGateway = systemGateway;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Object}
     */
    this.userPermissions = userPermissions;

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {{}}
     */
    this.queueData = {};

    /**
     * @type {number}
     */
    const intervalInSeconds = 10;

    const intervalPromise = $interval(() => {
      this.updateData();
    }, 1000 * intervalInSeconds);

    $rootScope.$on('$stateChangeStart',
      () => {
        $interval.cancel(intervalPromise);
      });

    // initial load
    this.updateData();
  }

  updateData() {
    this.loadingInProgress = true;
    this._systemGateway.getQueueStatus().then(data => {
      this.queueData = data;
      this.loadingInProgress = false;
    });
  }
}

SystemStatusController.$inject = [
  '$rootScope',
  '$interval',
  'systemGateway',
  'user',
  'userPermissions',
];

export default SystemStatusController;
