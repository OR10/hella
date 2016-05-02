import DataContainer from '../Support/DataContainer';

class CacheService {
  constructor() {
    this._caches = new Map();
  }

  container(id) {
    if (!this._caches.has(id)) {
      this._caches.set(id, new DataContainer(id));
    }

    return this._caches.get(id);
  }
}

export default CacheService;
