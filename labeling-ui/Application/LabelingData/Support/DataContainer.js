/**
 * A Container managing a set of data
 *
 * Should there be a need to manage metadata related to a data set, this management should also be implemented here.
 */
class DataContainer {
  constructor() {
    /**
     * @type {Map}
     * @protected
     */
    this._data = new Map();
  }

  /**
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    return this._data.has(key);
  }

  /**
   * @param {Array} keys
   * @returns {*}
   */
  hasAll(keys) {
    return keys.reduce((hadAllPrevious, key) => {
      return hadAllPrevious && this._data.has(key);
    }, true);
  }

  /**
   * Removes a single or all objects from this DataContainer.
   *
   * If a key is given this function will return a boolean indicating if given key was present before deletion.
   * Otherwise no return value will be provided.
   *
   * @param {*} [key]
   *
   * @returns {boolean|undefined}
   */
  invalidate(key) {
    if (key) {
      return this._data.delete(key);
    }

    return this._data.clear();
  }

  /**
   * Adds a new value to this DataContainer under the given key replacing any previous values for that key.
   *
   * @param {*} key
   * @param {*} value
   */
  set(key, value) {
    this._data.set(key, value);
  }

  /**
   * Returns the value for the given key
   *
   * @param {*} key
   * @returns {*}
   */
  get(key) {
    return this._data.get(key);
  }

  /**
   * Returns an array of values matching the given keys.
   *
   * @param {Array} keys
   * @returns {Array}
   */
  getAll(keys) {
    return keys.map(key => this._data.get(key));
  }
}

export default DataContainer;
