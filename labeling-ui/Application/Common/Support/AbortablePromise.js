/**
 * Abortable Promise implementation
 * @extends Promise
 */
class AbortablePromise {
  constructor($q, inputPromise, abortDeferred, parentAbortablePromise = null) {
    const innerDeferred = $q.defer();
    const innerPromise = innerDeferred.promise;

    let hasBeenAborted = false;
    let hasBeenHandled = false;
    const abortedCallbacks = [];

    /**
     * Abort this promise chain
     *
     * @name AbortablePromise#abort
     */
    this.abort = () => {
      hasBeenAborted = true;

      if (hasBeenHandled) {
        return;
      }

      abortedCallbacks.forEach(fn => fn());
      abortDeferred.resolve();
    };


    // Attach to the inputPromise chain
    inputPromise.then(result => {
      if (!hasBeenAborted) {
        hasBeenHandled = true;
        innerDeferred.resolve(result);
      }
    })
    .catch(error => {
      if (!hasBeenAborted) {
        hasBeenHandled = true;
        innerDeferred.reject(error);
      }
    });

    /**
     * @name AbortablePromise#then
     * @returns {AbortablePromise}
     */
    this.then = (...args) => {
      const newPromise = innerPromise.then(...args);
      return new AbortablePromise($q, newPromise, abortDeferred, this);
    };

    /**
     * @name AbortablePromise#catch
     * @returns {AbortablePromise}
     */
    this.catch = (...args) => {
      const newPromise = innerPromise.catch(...args);
      return new AbortablePromise($q, newPromise, abortDeferred, this);
    };

    /**
     * @name AbortablePromise#finally
     * @returns {AbortablePromise}
     */
    this.finally = (...args) => {
      const newPromise = innerPromise.finally(...args);
      return new AbortablePromise($q, newPromise, abortDeferred, this);
    };

    /**
     * @returns {AbortablePromise}
     * @param {Function} fn
     */
    this.aborted = fn => {
      abortedCallbacks.push(fn);
      return this;
    };
  }
}

export default AbortablePromise;
