import EventEmitter from 'event-emitter';

class LiveSyncIndicatorService extends EventEmitter {

  /**
   * @param {PouchDbSyncManager} pouchDbSyncManager
   */
  constructor(pouchDbSyncManager) {
    super();

    /**
     * @type {PouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;

    /**
     * @type {{offline: string, alive: string, transfer: string}}
     * @private
     */
    this._stateIconMap = {
      'offline': 'chain-broken',
      'alive': 'signal',
      'transfer': 'exchange',
    };

    /**
     * @type {{offline: string, alive: string, transfer: string}}
     * @private
     */
    this._stateToolTipMap = {
      'offline': 'There is currently no connection to the server',
      'alive': 'Connection to the server established, no data to transfer',
      'transfer': 'Data is synced with the server',
    };

    /**
     * @type {string}
     * @private
     */
    this._icon = this._stateIconMap.alive;

    this._toolTip = this._stateToolTipMap.alive;

    this._pouchDbSyncManager.on('offline', () => {
      this._icon = this._stateIconMap.offline;
      this._toolTip = this._stateToolTipMap.offline;

      this.emit('syncstate:updated', this._icon, this._toolTip);
    });
    this._pouchDbSyncManager.on('alive', () => {
      this._icon = this._stateIconMap.alive;
      this._toolTip = this._stateToolTipMap.alive;

      this.emit('syncstate:updated', this._icon, this._toolTip);
    });
    this._pouchDbSyncManager.on('transfer', () => {
      this._icon = this._stateIconMap.transfer;
      this._toolTip = this._stateToolTipMap.transfer;

      this.emit('syncstate:updated', this._icon, this._toolTip);
    });
  }

  /**
   * @return {string}
   */
  getIcon() {
    return this._icon;
  }

  /**
   * @param {string} icon
   */
  setIcon(icon) {
    this._icon = icon;
    this.emit('syncstate:updated', this._icon, this._toolTip);
  }

  /**
   * @return {string}
   */
  getToolTip() {
    return this._toolTip;
  }

  /**
   * @param {string} toolTip
   */
  setToolTip(toolTip) {
    this._toolTip = toolTip;
    this.emit('syncstate:updated', this._icon, this._toolTip);
  }
}

LiveSyncIndicatorService.$inject = [
  'pouchDbSyncManager',
];

export default LiveSyncIndicatorService;
