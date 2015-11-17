class AbortablePromiseProvider {
  /**
   * @return {Function}
   */
  $get($q) {
    /**
     * Wrap given promise in a way, that its result can be ignored/aborted
     * @param {Promise} promise
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
    }.bind(this);
  }
}

AbortablePromiseProvider.prototype.$get.$inject = [
  '$q',
];

export default AbortablePromiseProvider;