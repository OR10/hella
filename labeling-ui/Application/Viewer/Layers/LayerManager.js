import base64 from 'base64-js';

/**
 * Management component to keep track of an access the different layers of the viewer
 *
 * @class LayerManager
 */
export default class LayerManager {
  constructor() {
    /**
     * Dictionary of currently registered layers.
     *
     * Each layer gets a unique name during registration.
     *
     * @type {Object}
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

    return layer.layer;
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
      .sort((lhs, rhs) => lhs.order - rhs.order)
      .forEach(layer => delegator.dispatch(event, layer.layer));
  }

  /**
   * Exports the currently drawn image data for all layers in this manager
   * encoded as base64.
   *
   * @return {Object<String,String>}
   */
  exportLayerData() {
    const data = {};

    Object.values(this.layers).forEach(layer => {
      const rawData = layer.layer.exportData();

      data[layer.name] = {
        width: rawData.width,
        height: rawData.height,
        data: base64.fromByteArray(rawData.data),
      };
    });

    return data;
  }

  /**
   * Execute the given function for each layer known to the layer manager
   *
   * @param operation
   */
  forEachLayer(operation) {
    Object.values(this.layers).forEach(layer => {
      operation(layer.layer);
    });
  }
}
