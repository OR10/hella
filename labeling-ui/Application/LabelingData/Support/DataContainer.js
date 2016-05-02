/**
 * A Container managing a set of data
 *
 * Should there be a need to manage metadata related to a data set, this management should also be implemented here.
 */
class DataContainer {
  constructor(name) {
    /**
     * @type {Map}
     * @protected
     */
    this._data = new Map();

    /**
     * @type {string}
     * @private
     */
    this._name = name;
  }

  /**
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    return this._getKeyWithParents(key) !== undefined;
  }

  /**
   * @param {Array} keys
   * @returns {*}
   */
  hasAll(keys) {
    return keys.reduce((hadAllPrevious, key) => {
      return hadAllPrevious && this.has(key);
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
      return this._deleteKeyWithParents(key);
    }

    this._data.clear();
    return true;
  }

  /**
   * Adds a new value to this DataContainer under the given key replacing any previous values for that key.
   *
   * @param {*} key
   * @param {*} value
   */
  store(key, value) {
    this._setKeyWithParents(key, value);
  }

  /**
   * Returns the value for the given key
   *
   * @param {*} key
   * @returns {*}
   */
  get(key) {
    return this._getKeyWithParents(key);
  }

  /**
   * Returns an array of values matching the given keys.
   *
   * @param {Array} keys
   * @returns {Array}
   */
  getAll(keys) {
    return keys.map(key => this.get(key));
  }

  _setKeyWithParents(key, value) {
    const parts = key.split('.');
    const valueKey = parts.pop();

    let currentMap = this._data;
    parts.forEach(part => {
      if (!currentMap.has(part)) {
        currentMap.set(part, new Map());
      }

      currentMap = currentMap.get(part);
    });

    currentMap.set(valueKey, value);
    return currentMap;
  }

  _getKeyWithParents(key) {
    const parts = key.split('.');
    const valueKey = parts.pop();

    let currentMap = this._data;
    parts.forEach(part => {
      if (!currentMap.has(part)) {
        return undefined;
      }

      currentMap = currentMap.get(part);
    });

    return currentMap.get(valueKey);
  }

  _deleteKeyWithParents(key) {
    const parts = key.split('.');
    const valueKey = parts.pop();
    const possibleCleanups = [];

    let currentMap = this._data;
    parts.forEach(part => {
      if (!currentMap.has(part)) {
        return undefined;
      }

      const parent = currentMap;
      currentMap = currentMap.get(part);
      possibleCleanups.push({parent, map: currentMap, parentKey: part});
    });

    const retVal = currentMap.delete(valueKey);

    possibleCleanups.reverse().forEach(({parent, map, parentKey}) => {
      if (map.size === 0) {
        parent.delete(parentKey);
      }
    });

    return retVal;
  }
}

export default DataContainer;
