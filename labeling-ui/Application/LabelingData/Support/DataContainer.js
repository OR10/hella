/**
 * A Container holding a set of data and keeping track of metadata
 */
class DataContainer {
  constructor() {
    this._data = new Map();
  }

  has(key) {
    return this._data.has(key);
  }

  hasAll(keys) {
    return keys.reduce((hadAllPrevious, key) => {
      return hadAllPrevious && this._data.has(key);
    }, true);
  }

  invalidate(key) {
    if (key) {
      return this._data.delete(key);
    }

    return this._data.clear();
  }

  set(key, value) {
    return this._data.set(key, value);
  }

  get(key) {
    return this._data.get(key);
  }

  getAll(keys) {
    return keys.map(key => this._data.get(key));
  }
}

export default DataContainer;
