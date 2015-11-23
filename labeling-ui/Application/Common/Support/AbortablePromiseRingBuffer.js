/**
 * Ring buffer for AbortablePromises.
 *
 * Removed Promises will be automatically aborted.
 */
class AbortablePromiseRingBuffer {
  /**
   * @param {int} size
   */
  constructor(size) {
    /**
     * @type {Number}
     * @private
     */
    this._size = size;

    /**
     * @type {Array}
     * @private
     */
    this._buffer = [];
  }

  /**
   * Add a new AbortablePromise to the buffer
   *
   * If the buffer gets to crowed another promise will be removed
   *
   * @param {AbortablePromise} abortablePromise
   * @returns {AbortablePromise}
   */
  add(abortablePromise) {
    this._buffer.push(abortablePromise);
    if (this._buffer.length > this._size) {
      this._buffer.shift().abort();
    }

    return abortablePromise;
  }
}

export default AbortablePromiseRingBuffer;
