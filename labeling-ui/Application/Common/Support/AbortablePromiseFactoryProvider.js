/**
 * Provider for a {@link AbortablePromiseFactory}
 */
class AbortablePromiseFactoryProvider {
  /**
   * @return {Function}
   */
  $get($q) {
    /**
     * Wrap given promise in a way, that its result can be ignored/aborted
     *
     * If an `abortDeferred` is given it will be resolved in case the promise is aborted
     *
     * @param {Promise} promise
     * @param {Deferred?} abortDeferred
     * @name AbortablePromiseFactory
     * @return {AbortablePromise}
     */
    return function abortable(inputPromise, abortDeferred = $q.defer()) {
      const deferred = $q.defer();
      const promise = deferred.promise;
      let hasBeenAborted = false;

      promise.abort = () => {
        hasBeenAborted = true;
        if (typeof inputPromise.abort === 'function') {
          inputPromise.abort();
        }
        abortDeferred.resolve();
      };

      inputPromise.then(result => {
        if (!hasBeenAborted) {
          deferred.resolve(result);
        }
      })
      .catch(error => {
        if (!hasBeenAborted) {
          deferred.reject(error);
        }
      });

      return promise;
    };
  }
}

AbortablePromiseFactoryProvider.prototype.$get.$inject = [
  '$q',
];

export default AbortablePromiseFactoryProvider;

/**
 * @name AbortablePromise
 * @extends Promise
 */

/**
 * Abort the Promise
 *
 * @name AbortablePromise#abort
 */