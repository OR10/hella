import AssemblyJob from './AssemblyJob';

/**
 * Create an AssemblyJob
 */
class AssemblyJobFactory {
  /**
   * @param {angular.$q} $q
   */
  constructor($q) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;
  }

  /**
   * @param {Function} workFn
   * @param {*?} data
   *
   * @return {AssemblyJob}
   */
  create(workFn, data) {
    return new AssemblyJob(this._$q, workFn, data);
  }
}

AssemblyJobFactory.$inject = [
  '$q',
];

export default AssemblyJobFactory;
