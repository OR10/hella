class AssemblyJob {
  /**
   * @param {angular.$q} $q
   * @param {Function} workFn
   * @param {*} data
   */
  constructor($q, workFn, data = null) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Function}
     *
     * @private
     */
    this._workFn = workFn;

    /**
     * Arbitrary data associated with this Job
     *
     * @type {*}
     * @private
     */
    this._data = data;

    /**
     * @type {string}
     * @private
     */
    this._state = AssemblyJob.STATE_WAITING;


    /**
     * @type {$q.Deferred}
     * @private
     */
    this._isFinishedDeferred = this._$q.defer();
  }

  /**
   * @returns {Promise}
   */
  getIsFinishedPromise() {
    return this._isFinishedDeferred.promise;
  }

  /**
   * @returns {string}
   */
  getState() {
    return this._state;
  }

  /**
   * @returns {*}
   */
  getData() {
    return this._data;
  }

  /**
   * @param {*} newData
   */
  setData(newData) {
    this._data = newData;
  }

  run() {
    this._state = AssemblyJob.STATE_RUNNING;
    const workPromise = this._workFn();
    workPromise
      .then(result => this._isFinishedDeferred.resolve(result))
      .catch(reason => this._isFinishedDeferred.reject(reason));

    return workPromise;
  }
}

AssemblyJob.STATE_WAITING = 'state.waiting';
AssemblyJob.STATE_RUNNING = 'state.running';

export default AssemblyJob;
