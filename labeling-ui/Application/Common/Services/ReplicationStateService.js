/**
 * Service to provide information about the current replication state
 */
class ReplicationStateService {
  /**
   * @param {Object} configuration injected
   */
  constructor(configuration, $rootScope) {
    const that = this;
    this.configuration = configuration;
    this._isReplicating = false;
  }

  setIsReplicating(state) {
    this._isReplicating = state === true;
    try {
      $rootScope.$digest()
    } catch(err) {
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
