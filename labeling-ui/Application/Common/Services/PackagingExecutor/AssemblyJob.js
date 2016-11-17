class AssemblyJob {
  /**
   * @param {Function} workFn
   * @param {*} data
   */
  constructor(workFn, data = null) {
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
     * @type {Function|null}
     * @private
     */
    this._isFinishedResolver = null;

    /**
     * @type {Function|null}
     * @private
     */
    this._isFinishedRejector = null;

    /**
     * @type {Promise|null}
     * @private
     */
    this._isFinishedPromise = new Promise(
      (resolve, reject) => {
        this._isFinishedResolver = resolve;
        this._isFinishedRejector = reject;
      }
    );
  }

  /**
   * @returns {Promise}
   */
  getIsFinishedPromise() {
    return this._isFinishedPromise;
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
      .then((...args) => this._isFinishedResolver(...args))
      .catch((...args) => this._isFinishedRejector(...args));

    return workPromise;
  }
}

AssemblyJob.STATE_WAITING = 'state.waiting';
AssemblyJob.STATE_RUNNING = 'state.running';

export default AssemblyJob;