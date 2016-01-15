/**
 * Gateway for retrieving information about Tasks
 */
class TaskGateway {
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
   * Retrieves a list of available {@link Task}s
   *
   * @return {AbortablePromise<Task[]|Error>}
   */
  getTasks() {
    const url = this._apiService.getApiUrl('/task');
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.tasks) {
          throw new Error('Failed loading task list');
        }

        return response.data.result.tasks;
      });
  }

  /**
   * Retrieves a list of available {@link Task}s and their associated videos
   *
   * @return {AbortablePromise<{tasks: Task[], videos: Object<string, Video>}|Error>}
   */
  getTasksAndVideos() {
    const url = this._apiService.getApiUrl('/task', {includeVideos: true});
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.tasks || !response.data.result.videos) {
          throw new Error('Failed loading task list');
        }

        return response.data.result;
      });
  }

  /**
   * Retrieves the {@link Task} identified by the given `id`
   *
   * @param {string} id
   *
   * @return {AbortablePromise.<Task|Error>}
   */
  getTask(id) {
    const url = this._apiService.getApiUrl(`/task/${id}`);
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${id}`);
      });
  }

  /**
   * @param {Task} task
   * @returns {AbortablePromise}
   */
  markTaskAsLabeled(task) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/mark/labeled`);
    return this._bufferedHttp.post(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${task.id}) as labeled.`);
      });
  }
}

TaskGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TaskGateway;
