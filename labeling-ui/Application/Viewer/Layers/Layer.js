/**
 * Interface of every Layer rendered to the Viewer
 *
 * @interface Layer
 */

/**
 * Execute all drawing and/or rendering operation to update the visual
 * representation of the layer to its current state.
 *
 * @name Layer#render
 */

/**
 * Attach the Layer to the given DOM Node.
 * The DOM node is supposed to be the rendering target of the layer.
 *
 * @name Layer#attachToDom
 * @param {Element} element
 */

/**
 * Dispatch an Event to the underlying DOM Elements
 *
 * @name Layer#dispatchDOMEvent
 * @param {Event} event
 */

/**
 * Resize the layer to the given size
 *
 * @name Layer#resize
 * @param {Number} width
 * @param {Number} height
 */

/**
 * Exports the currently drawn image data for this layer as pixel data array.
 *
 * @name Layer#exportData
 * @returns {ImageData|null}
 */

