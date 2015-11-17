class AbortablePromiseProvider {
  /**
   * @param {$q} $q
   */
  constructor($q) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
  }

  /**
   * @return {Function}
   */
  $get() {
    /**
     * Wrap given promise in a way, that its result can be ignored/aborted
     * @param {Promise} promise
     */
    return function abortable(inputPromise) {
      const deferred = this._$q.defer();
      const promise = deferred.promise;
      deferred.__aborted__ = false;
      promise.abort = () => deferred.__aborted__ = true;

      inputPromise.then(result => {
        if (!deferred.__aborted__) {
          deferred.resolve(result);
        }
      })
      .catch(error => {
        if (!deferred.__aborted__) {
          deferred.reject(error);
        }
      });

      return promise;
    }.bind(this);
  }
}

export default AbortablePromiseProvider;