import liveSyncIndicatorTemplate from './LiveSyncIndicatorDirective.html!';

/**
 * Directive to display syncprogress
 */
class LiveSyncIndicatorDirective {
  constructor(pouchDbSyncManager) {
    this._pouchDbSyncManager = pouchDbSyncManager;
    this.scope = {};
    this.template = liveSyncIndicatorTemplate;
  }

  link(scope) {
    const stateToIcon = {
      'offline': 'plug',
      'alive': 'heartbeat',
      'transfer': 'bullseye',
    };

    scope.syncState = stateToIcon.offline;
    this._pouchDbSyncManager.on('offline', () => {
      scope.syncState = stateToIcon.offline;
    });
    this._pouchDbSyncManager.on('alive', () => {
      scope.syncState = stateToIcon.alive;
    });
    this._pouchDbSyncManager.on('transfer', () => {
      scope.syncState = stateToIcon.transfer;
    });
  }
}

LiveSyncIndicatorDirective.$inject = [
  'pouchDbSyncManager',
];

export default LiveSyncIndicatorDirective;
