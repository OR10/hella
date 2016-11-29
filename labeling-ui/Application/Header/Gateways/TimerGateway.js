/**
 * Gateway for retrieving timer data
 */
class TimerGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
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
    // @TODO: Port PHP Logic
    //
    // if ($user !== $this->tokenStorage->getToken()->getUser()) {
    //    throw new Exception\AccessDeniedHttpException('Its not allowed to access the timer for other users');
    // }
    //
    // $result = $this->documentManager
    //     ->createQuery('annostation_task_timer', 'by_taskId_userId')
    //     ->setKey([$task->getId(), $user->getId()])
    //     ->setLimit(1)
    //     ->onlyDocs(true)
    //     ->execute()
    //     ->toArray();
    const url = this._apiService.getApiUrl(`/task/${taskId}/timer/${userId}`);
    return this._bufferedHttp.get(url, undefined, 'timer')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading time');
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
