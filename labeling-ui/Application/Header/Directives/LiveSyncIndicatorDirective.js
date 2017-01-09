import liveSyncIndicatorTemplate from './LiveSyncIndicatorDirective.html!';

/**
 * Directive to display sync progress
 */
class LiveSyncIndicatorDirective {
  constructor(pouchDbSyncManager) {
    this._pouchDbSyncManager = pouchDbSyncManager;
    this.scope = {};
    this.template = liveSyncIndicatorTemplate;
  }

  link(scope) {
    const stateToIcon = {
      'offline': 'chain-broken',
      'alive': 'signal',
      'transfer': 'exchange',
    };

    const stateTooltipText = {
      'offline': 'There is currently no connection to the server',
      'alive': 'Connection to the server established, no data to transfer',
      'transfer': 'Data is synced with the server',
    };

    scope.syncState = stateToIcon.offline;
    scope.syncTooltip = stateTooltipText.offline;

    this._pouchDbSyncManager.on('offline', () => {
      scope.syncState = stateToIcon.offline;
      scope.syncTooltip = stateTooltipText.offline;
    });
    this._pouchDbSyncManager.on('alive', () => {
      scope.syncState = stateToIcon.alive;
      scope.syncTooltip = stateTooltipText.alive;
    });
    this._pouchDbSyncManager.on('transfer', () => {
      scope.syncState = stateToIcon.transfer;
      scope.syncTooltip = stateTooltipText.transfer;
    });
  }
}

LiveSyncIndicatorDirective.$inject = [
  'pouchDbSyncManager',
];

export default LiveSyncIndicatorDirective;
