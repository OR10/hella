/**
 * Queue like construct, which holds all jobs to be executed in a dependant order.
 *
 * Execution border (packages) are selected by the given strategy.
 */
class Assembly {
  /**
   * @param {string} name
   * @param {AssemblyStrategy} strategy
   */
  constructor(name, strategy) {
    /**
     * Name of this Assembly
     *
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * @type {AssemblyStrategy}
     * @private
     */
    this._strategy = strategy;

    /**
     * Ordered list of Jobs to be executed within this assembly
     *
     * @type {Array.<AssemblyJob>}
     * @private
     */
    this._jobs = [];

    /**
     * Latest package boundary position
     *
     * The Assembly will always provide jobs up to this boundary for execution.
     *
     * The boundary is provided as index into the jobs array. The boundary is set **before** the element with the given
     * index
     *
     * @type {int}
     * @private
     */
    this._boundary = 0;

    /**
     * Subscribers registered to be informed of actions inside of the Assembly
     *
     * @type {Set.<Function>}
     * @private
     */
    this._actionListeners = new Set();
  }

  /**
   * Subscribe to actions happening on the assembly
   *
   * @param {Function} subscriberFn
   */
  subscribe(subscriberFn) {
    this._actionListeners.add(subscriberFn);
  }

  /**
   * Remove a previously added subscription
   *
   * @param {Function} subscriberFn
   * @returns {boolean}
   */
  unsubscribe(subscriberFn) {
    return this._actionListeners.delete(subscriberFn);
  }

  /**
   * Enqueue a job for processing as soon as the {@link AssemblyStrategy} allows.
   *
   * @param {AssemblyJob} job
   */
  enqueue(job) {
    this._jobs.push(job);
    this._cycle(Assembly.ACTION_JOB_ADDED);
  }

  /**
   * Execute a run cycle because of the given reason
   *
   * @param {string} action
   * @private
   */
  _cycle(action) {
    // Update the boundary position using the injected strategy, because the given action occurred.
    this._boundary = this._strategy.getPackageBoundary(
      action,
      this._jobs,
      this._boundary
    );

    this._runNextNonRunningJobBeforeBoundary();
  }

  /**
   * Find the next non running job before the boundary
   *
   * If no such job exists `null` is returned.
   *
   * @return {AssemblyJob|null}
   *
   * @private
   */
  _findNextNonRunningJobBeforeBoundary() {
    let jobIndex = 0;
    let nextNonRunningJob = null;

    while(jobIndex < this._jobs.length && jobIndex < this._boundary) {
      const possibleJob = this._jobs[jobIndex];
      if (possibleJob.getState() !== AssemblyJob.STATE_WAITING) {
        continue;
      }

      nextNonRunningJob = possibleJob;
      break;
    }
  }

  /**
   * Execute the next non-running job before the boundary. If there is no such job nothing will be done.
   *
   * Successful execution of the next job before the boundary will trigger another cycle recursively until the boundary
   * is reached
   *
   * @private
   */
  _runNextNonRunningJobBeforeBoundary() {
    const job = this._findNextNonRunningJobBeforeBoundary();

    if (job === null) {
      return;
    }

   job.run()
      .then(job => this._handleJobFinished(job))
      .catch(job => this._handleJobFailed(job));

    this._cycle(Assembly.ACTION_STATE_CHANGE);
  }

  /**
   * Handle the needed operations once a job finished processing
   *
   * @param {AssemblyJob} job
   * @private
   */
  _handleJobFinished(job) {
    const jobIndex = this._jobs.findIndex(possibleJob => possibleJob === job);
    this._jobs.splice(jobIndex);
    this._cycle(Assembly.ACTION_JOB_REMOVED);
  }

  /**
   * Handle the needed operations once a job failed during processing
   *
   * @param {AssemblyJob} job
   * @private
   */
  _handleJobFailed(job) {
    const jobIndex = this._jobs.findIndex(possibleJob => possibleJob === job);
    this._jobs.splice(jobIndex);
    this._cycle(Assembly.ACTION_JOB_REMOVED);
  }
}

Assembly.ACTION_STATE_CHANGE = 'action.state.change';
Assembly.ACTION_JOB_ADDED = 'action.job.added';
Assembly.ACTION_JOB_REMOVED = 'action.job.removed';

export default Assembly;