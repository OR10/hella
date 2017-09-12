class ToolSelectorListenerService {
  constructor() {
    this._listeners = new Map();
    this._lastCallParams = [];
  }

  /**
   * Adds a listener and returns an identifier string,
   * which could be used to remove a listener, if
   * removeListener() was implemented
   *
   * @param {Function} listener
   * @returns {string}
   */
  addListener(listener, tool = null, callImmediately = false) {
    const nextLength = this._listeners.size + 1;
    const identifier = `${ToolSelectorListenerService.getClass()}#${nextLength}`;
    const listenerConfig = {tool, listener};
    this._listeners.set(identifier, listenerConfig);

    if (callImmediately && this._lastCallParams.length > 0) {
      this._triggerListener(listenerConfig);
    }

    return identifier;
  }

  /**
   * REMOVE ALL THE LISTENERS!
   */
  removeAllListeners() {
    this._listeners.clear();
  }

  /**
   * @param {{id, shape, name}} newLabelStructureObject
   * @param {{id, shape, name}} oldLabelStructureObject
   */
  trigger(newLabelStructureObject, oldLabelStructureObject = null) {
    this._lastCallParams = [
      newLabelStructureObject.shape,
      newLabelStructureObject,
      oldLabelStructureObject,
    ];

    this._listeners.forEach(listenerConfig => {
      this._triggerListener(listenerConfig);
    });
  }

  _triggerListener(listenerConfig) {
    const toolListener = listenerConfig.tool;
    const triggeredTool = this._lastCallParams[0];

    if (toolListener === null || toolListener === triggeredTool) {
      listenerConfig.listener(...this._lastCallParams);
    }
  }
}

ToolSelectorListenerService.getClass = () => {
  return 'ToolSelectorListenerService';
};

ToolSelectorListenerService.$inject = [];

export default ToolSelectorListenerService;
