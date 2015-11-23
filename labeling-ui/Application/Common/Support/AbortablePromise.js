/**
 * Abortable Promise implementation
 * @extends Promise
 */
class AbortablePromise {
  constructor($q, inputPromise, abortDeferred, parentAbortablePromise = null) {
    const innerDeferred = $q.defer();
    const innerPromise = innerDeferred.promise;

    let hasBeenAborted = false;

    /**
     * Abort this promise chain
     *
     * @name AbortablePromise#abort
     */
    this.abort = () => {
      hasBeenAborted = true;
      if (parentAbortablePromise !== null) {
        parentAbortablePromise.abort();
      }
      abortDeferred.resolve();
    };


    // Attach to the inputPromise chain
    inputPromise.then(result => {
      if (!hasBeenAborted) {
        innerDeferred.resolve(result);
      }
    })
    .catch(error => {
      if (!hasBeenAborted) {
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
  }
}

export default AbortablePromise;
