/**
 * Interface of every Layer rendered to the Viewer
 *
 * @interface Layer
 */

/**
 * Execute all drawing and/or rendering operation to update the visual
 * representation of the layer to its current state.
 *
 * @method render
 */

/**
 * Attach the Layer to the given DOM Node.
 * The DOM node is supposed to be the rendering target of the layer.
 *
 * @method attachToDom
 * @param {Element} element
 */

/**
 * Dispatch an Event to the underlying DOM Elements
 *
 * @method dispatchDOMEvent
 * @param {Event} event
 */

/**
 * Exports the currently drawn image data for this layer encoded as base64 data urls.
 *
 * @method exportData
 *
 * @returns {String}
 */

