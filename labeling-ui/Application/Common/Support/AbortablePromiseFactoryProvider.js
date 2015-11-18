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
     * @param {Promise} promise
     * @name AbortablePromiseFactory
     */
    return function abortable(inputPromise) {
      const deferred = $q.defer();
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
    };
  }
}

AbortablePromiseFactoryProvider.prototype.$get.$inject = [
  '$q',
];

export default AbortablePromiseFactoryProvider;
