class ReferenceCountingLock {
  constructor($q, onRelease = () => {}) {
    this._$q = $q;
    this._onRelease = onRelease;

    this._refCount = 0;

    this._releaseResolvers = [];
  }

  acquire() {
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
