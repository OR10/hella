import ReferenceCountingLock from '../Support/ReferenceCountingLock';
/**
 * Service providing synchronization for operations on resources similar to a semaphore
 */
class LockService {
  /**
   * @param {angular.$q} $q
   */
  constructor($q) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Map}
     * @private
     */
    this._locks = new Map();
  }

  /**
   * Acquire the lock with the given id. Once the lock is available the given callback will be executed with
   * a function to release the lock as the first parameter.
   *
   * @param {String} lockId
   * @param {Function} onLockAvailable
   */
  acquire(lockId, onLockAvailable) {
    let lock;

    if (this._locks.has(lockId)) {
      lock = this._locks.get(lockId);
    } else {
      lock = this._$q.resolve();
    }

    lock = lock.then(() => this._$q(onLockAvailable));

    this._locks.set(lockId, lock);

    return lock;
  }

  createRefCountLock(onReleased) {
    return new ReferenceCountingLock(this._$q, onReleased);
  }
}

LockService.$inject = ['$q'];

export default LockService;
