/**
 * Abstract base class for any LazyStore implementation
 */
class AbstractLazyStoreService {
  constructor() {
    this._fetchedData = new Map();
  }

  /**
   * @param {string} id
   * @param {*} data
   * @param {number} maxLifetime
   * @returns {*}
   * @protected
   */
  _storeFetchedData(id, data, maxLifetime) {
    this._fetchedData.set(id, {
      lastUpdated: Date.now(),
      maxLifetime,
      data,
    });

    return data;
  }

  /**
   * @param {string} id
   * @returns {boolean}
   * @protected
   */
  _isDataFetched(id) {
    if (!this._fetchedData.has(id)) {
      return false;
    }

    const fetched = this._fetchedData.get(id);
    if (fetched.lastUpdated + (fetch.maxLifetime * 1000) > Date.now()) {
      return false;
    }

    return true;
  }

  /**
   * @param {string} id
   * @returns {*}
   * @protected
   */
  _getFetchedData(id) {
    if (!this._isDataFetched(id)) {
      throw new Error(`Tried to retrieve non yet lazily fetched data with id ${id}`);
    }

    return this._fetchedData.get(id).data;
  }

  /**
   * @param {string} id
   * @param {Function} fetch
   * @param {number?} maxLifetime
   * @param {boolean} force
   * @returns {Promise.<*>}
   * @protected
   */
  _lazyFetch(id, fetch, maxLifetime = Infinity, force = false) {
    if (!force && this._isDataFetched(id)) {
      return Promise.resolve(this._getFetchedData(id));
    }
    return fetch().then(data => this._storeFetchedData(id, data, maxLifetime));
  }
}

AbstractLazyStoreService.$inject = [];

export default AbstractLazyStoreService;
