export default class LayerManager {
  constructor() {
    /**
     * Dictionary of currently registered layers.
     *
     * Each layer gets a unique name during registration.
     *
     * @type {Array}
     */
    this.layers = {};

    /**
     * Internal tracking variable for the number of layers currently managed
     *
     * @type {number}
     * @private
     */
    this._layerCount = 0;

    /**
     * Optional layer to delegate events to other layers.
     *
     * @type {EventDelegationLayer|null}
     * @private
     */
    this._eventDelegationLayer = null;

    this._onNewDelegationEvent = this._onNewDelegationEvent.bind(this);
  }

  /**
   * Set and activate a specific event delegation layer
   *
   * @param {EventDelegationLayer} eventDelegationLayer
   */
  setEventDelegationLayer(eventDelegationLayer) {
    if (this._eventDelegationLayer !== null) {
      this._eventDelegationLayer.off('event:new', this._onNewDelegationEvent);
    }
    this._eventDelegationLayer = eventDelegationLayer;
    this._eventDelegationLayer.on('event:new', this._onNewDelegationEvent);
  }

  /**
   * Register the given layer under the given name
   *
   * @param {string} name
   * @param {Layer} layer
   */
  addLayer(name, layer) {
    if (this.layers[name] !== undefined) {
      throw new Error(`Layer could not be added: Layer with name ${name} does already exist.`);
    }

    this.layers[name] = {layer, name, order: this._layerCount};
    this._layerCount += 1;
  }

  /**
   * Replace an already registered layer with another one
   *
   * @param {string} name
   * @param {Layer} layer
   */
  replaceLayer(name, layer) {
    const oldLayer = this.layers[name];
    if (oldLayer === undefined) {
      throw new Error(`Layer could not be replaced: Layer with name ${name} does not exist.`);
    }

    const {order} = oldLayer;
    this.layers[name] = {layer, name, order};
  }

  /**
   * Retrieve a layer registered under a specific name
   *
   * @param {string} name
   * @returns {Layer}
   */
  getLayer(name) {
    const layer = this.layers[name];
    if (layer === undefined) {
      throw new Error(`Layer could not be retrieved: Layer with name ${name} does not exist.`);
    }

    return layer;
  }

  /**
   * Handle delegation of events by a registered {@link EventDelegationLayer}
   *
   * @param {EventDelegationLayer} delegator
   * @param {Event} event
   * @private
   */
  _onNewDelegationEvent(delegator, event) {
    Object.values(this.layers)
      .sort((a, b) => a.order - b.order)
      .forEach(layer => delegator.dispatch(event, layer));
  }
}