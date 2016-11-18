import AssemblyJob from './AssemblyJob';

/**
 * Create an AssemblyJob
 */
class AssemblyJobFactory {
  /**
   * @param {angular.$q} $q
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor($q, abortablePromiseFactory) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;
  }

  /**
   * @param {Function} workFn
   * @param {*?} data
   *
   * @return {AssemblyJob}
   */
  create(workFn, data) {
    return new AssemblyJob(
      this._$q,
      this._abortablePromiseFactory,
      workFn,
      data
    );
  }
}

AssemblyJobFactory.$inject = [
  '$q',
  'abortablePromiseFactory',
];

export default AssemblyJobFactory;
