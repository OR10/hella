import AbortablePromise from './AbortablePromise';

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
     * @type {Function}
     * @return {AbortablePromise}
     */
    return function abortable(inputPromise, abortDeferred = $q.defer()) {
      return new AbortablePromise($q, inputPromise, abortDeferred);
    };
  }
}

AbortablePromiseFactoryProvider.prototype.$get.$inject = [
  '$q',
];

export default AbortablePromiseFactoryProvider;

