/**
 * Service to provide information about the current replication state
 */
class ReplicationStateService {
  /**
   * @param {Object} configuration
   * @param {$rootScope} $rootScope
   */
  constructor(configuration, $rootScope) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {Object}
     */
    this.configuration = configuration;

    /**
     * @type {boolean}
     * @private
     */
    this._isReplicating = false;
  }

  setIsReplicating(state) {
    this._isReplicating = !!state;
    try {
      this._$rootScope.$digest();
    } catch (err) {
      // digestion possibly running.
    }
  }

  isReplicating() {
    return this._isReplicating;
  }
}

ReplicationStateService.$inject = [
  'applicationConfig',
  '$rootScope',
];

export default ReplicationStateService;
