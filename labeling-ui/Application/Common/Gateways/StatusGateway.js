/**
 * Gateway for retrieving information about running background {@link Job}s
 */
class StatusGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {$timeout} $timeout
   * @param {$q} $q
   */
  constructor(apiService, bufferedHttp, $timeout, $q) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {$timeout}
     * @private
     */
    this._$timeout = $timeout;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
  }


  /**
   * Returns the {@link Status} for the given {@link Job}
   *
   * @param {Job} job
   * @returns {AbortablePromise<Status|Error>}
   */
  getStatus(job) {
    const url = this._apiService.getApiUrl(
      `/v1/status/${job.type}/${job.id}`
    );
    return this._bufferedHttp.get(url, undefined, 'status')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading status for job ${job.type}/${job.id}`);
      });
  }

  /**
   * Automatically check a given job for completion.
   *
   * A promise will be returned, which will be resolved once the job completed.
   *
   * The backend will be automatically polled for updates on the completion of the job.
   *
   * Optionally an `interval` in msecs may be given, which should be used for polling.
   * The default value is 2500msecs.
   *
   * By default the maximum wait time before the Promise is rejected is 10 seconds.
   * If you want to wait indefinitely just pass `Infinity` to `maxWait`. Otherwise an arbitrary value
   * in msecs is acceptable.
   *
   * @param {Job} job
   * @param {int} interval
   * @param {int} maxWait
   * @return {Promise.<Status|Error>}
   */
  waitForJob(job, interval = 2500, maxWait = 10000) {
    let waited = 0;
    const deferred = this._$q.defer();
    const checkIfFinished = () => this.getStatus(job)
      .then(status => {
        if (status.status === 'success') {
          deferred.resolve(status);
          return;
        } else if (status.status === 'error') {
          deferred.reject(status);
          return;
        }

        if (waited >= maxWait) {
          deferred.reject(new Error('Max wait time has been reached.'));
          return;
        }

        waited += interval;

        this._$timeout(interval).then(checkIfFinished);
      });

    checkIfFinished();
    return deferred.promise;
  }
}

StatusGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$timeout',
  '$q',
];

export default StatusGateway;
