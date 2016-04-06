/**
 * Reference counting lock for handling multiple acquires and releases of the same lock
 */
class ReferenceCountingLock {
  constructor($q,
              onAcquire = () => {},
              onRelease = () => {}) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Function}
     * @private
     */
    this._onAcquire = onAcquire;

    /**
     * @type {Function}
     * @private
     */
    this._onRelease = onRelease;

    /**
     * @type {Integer}
     * @private
     */
    this._refCount = 0;

    /**
     * @type {Array}
     * @private
     */
    this._releaseResolvers = [];
  }

  acquire() {
    // If the lock ist aquired for the first time, trigger the onAcquire function
    if (this._refCount === 0) {
      this._onAcquire();
    }
    return this._$q(resolve => {
      this._refCount += 1;
      this._releaseResolvers.push(resolve);
    });
  }

  release() {
    if (this._refCount === 0) {
      throw new Error('Tried to release already free lock!');
    }

    this._refCount -= 1;

    if (this._refCount === 0) {
      this._releaseResolvers.reverse().forEach(resolve => resolve());
      this._releaseResolvers = [];
      this._onRelease();
    }
  }

  get isLocked() {
    return this._refCount > 0;
  }
}

export default ReferenceCountingLock;
