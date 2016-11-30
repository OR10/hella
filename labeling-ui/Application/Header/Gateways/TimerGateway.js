/**
 * Gateway for retrieving timer data
 */
class TimerGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(pouchDbContextService, packagingExecutor, apiService, bufferedHttp) {
    /**
     * @type {PouchDBContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {PackagingExecutorService}
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {BufferedHttp}
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Gets the time for the given {@link Task}
   *
   * @param {string} taskId
   * @param {string} userId
   * @return {AbortablePromise<int|Error>}
   */
  getTime(taskId, userId) {
    const queueIdentifier = 'timer';
    const viewIdentifier = 'annostation_task_timer/by_taskId_userId';
    const db = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(viewIdentifier, {
        include_docs: true,
        key: [taskId, userId],
      }))
      .then(response => response.rows[0])
      .then(timeDocument => {
        if (typeof timeDocument !== 'object') {
          throw new Error('Failed loading time');
        }
      });
  }


/**
   * Starts export for the given {@link Task} and export type
   *
   * @param {string} taskId
   * @param {string} userId
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(taskId, userId, time) {
  // @TODO: Port PHP Logic
  //    // if ($user !== $this->tokenStorage->getToken()->getUser()) {
  //    throw new Exception\AccessDeniedHttpException('Its not allowed to set the timer for other users');
  //   }
  // if (($timeInSeconds = $request->request->get('time')) === null) {
  //   throw new Exception\BadRequestHttpException('Missing time');
  // }
  //
  // if (!is_int($timeInSeconds)) {
  //   throw new Exception\BadRequestHttpException('Time must be an integer');
  // }
  //
  // $this->documentManager->persist($taskTimer);
  // $this->documentManager->flush();

    const url = this._apiService.getApiUrl(`/task/${taskId}/timer/${userId}`);
    return this._bufferedHttp.put(url, {time}, undefined, 'timer')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed saving time');
      });
  }
}

TimerGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TimerGateway;
