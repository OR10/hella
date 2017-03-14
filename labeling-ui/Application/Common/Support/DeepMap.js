/**
 * Map implementation which allows for nested map structures
 */
class DeepMap {
  constructor() {
    /**
     * @type {Map}
     * @private
     */
    this._baseMap = new Map();
  }

  get size() {
    return this._getSizeRecursive(this._baseMap);
  }

  _getSizeRecursive(currentMap) {
    let size = 0;
    for (const [, value] of currentMap) {
      if (value !== undefined && value instanceof Map) {
        size += this._getSizeRecursive(value);
      } else {
        size += 1;
      }
    }

    return size;
  }

  clear() {
    this._baseMap.clear();
  }

  get(...keys) {
    let currentEntry = this._baseMap;
    for (const key of keys) {
      currentEntry = currentEntry.get(key);
      if (currentEntry === undefined) {
        return undefined;
      }
    }

    return currentEntry;
  }

  has(...keys) {
    const {keysWithoutLast, lastKey} = this._splitKeys(keys);
    let currentEntry = this._baseMap;

    for (const key of keysWithoutLast) {
      currentEntry = currentEntry.get(key);
      if (currentEntry === undefined) {
        return false;
      }
    }

    return currentEntry.has(lastKey);
  }

  ['delete'](...keys) {
    const {keysWithoutLast, lastKey} = this._splitKeys(keys);

    let currentEntry = this._baseMap;
    for (const key of keysWithoutLast) {
      currentEntry = currentEntry.get(key);
      if (currentEntry === undefined) {
        return false;
      }
    }

    return currentEntry.delete(lastKey);
  }

  set(...keysAndValue) {
    const {keysWithoutLast: keys, lastKey: value} = this._splitKeys(keysAndValue);
    const {keysWithoutLast, lastKey} = this._splitKeys(keys);

    let currentEntry = this._baseMap;
    for (const key of keysWithoutLast) {
      if (currentEntry.get(key) === undefined) {
        // Create new level
        const newMap = new Map();
        currentEntry.set(key, newMap);
        currentEntry = newMap;
      } else if (!(currentEntry.get(key) instanceof Map)) {
        throw new Error(`Trying to overwrite existing value with new branch: ${JSON.stringify(keys)} at ${JSON.stringify(key)}`);
      } else {
        // Reuse already existing level
        currentEntry = currentEntry.get(key);
      }
    }

    const currentlyStoredInformation = currentEntry.get(lastKey);
    if (currentlyStoredInformation !== undefined && currentlyStoredInformation instanceof Map) {
      throw new Error(`Trying to overwrite complete branch in deepmap: ${JSON.stringify(keys)}`);
    }

    return currentEntry.set(lastKey, value);
  }

  entries() {
    return DeepMap.iterateMapRecursive(this._baseMap);
  }

  static *iterateMapRecursive(iterationMap, fullKey = []) {
    for (const [key, value] of iterationMap) {
      const newFullKey = fullKey.concat([key]);
      if (value !== undefined && value instanceof Map) {
        yield *DeepMap.iterateMapRecursive(value, newFullKey);
      } else {
        yield [newFullKey, value];
      }
    }
  }

  _splitKeys(keys) {
    return {
      keysWithoutLast: keys.slice(0, keys.length - 1),
      lastKey: keys[keys.length - 1],
    };
  }
}

export default DeepMap;
