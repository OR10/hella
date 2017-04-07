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
    const removeOnFinish = this._remove.bind(this, abortablePromise);
    abortablePromise.aborted(removeOnFinish);
    abortablePromise.then(removeOnFinish);
    abortablePromise.catch(removeOnFinish);

    this._buffer.push(abortablePromise);

    if (this._buffer.length > this._size) {
      this._buffer.shift().abort();
    }

    return abortablePromise;
  }

  /**
   * Remove a promise at the given array index
   *
   * @param index
   */
  _remove(abortablePromise) {
    const index = this._buffer.find(promise => promise === abortablePromise);
    if (index !== undefined) {
      this._buffer.splice(index, 1);
    }
  }
}

export default AbortablePromiseRingBuffer;
