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
   * @return {AbortablePromise<{taskTypes: TaskTypes, videos: Object<string, Video>}|Error>}
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
   * Retrieves a list of available {@link Task}s and their associated videos for a certain project
   *
   * @return {AbortablePromise<{taskTypes: TaskTypes, videos: Object<string, Video>}|Error>}
   */
  getTasksAndVideosForProject(projectId, status, limit = null, offset = null) {
    const params = {
      project: projectId,
      status,
    };

    if (limit) {
      params.limit = limit;
    }

    if (offset) {
      params.offset = offset;
    }

    const url = this._apiService.getApiUrl('/task', params);

    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.tasks || !response.data.result.videos || !response.data.result.users) {
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
    const url = this._apiService.getApiUrl(`/task/${task.id}/status/labeled`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${task.id}) as labeled.`);
      });
  }

  /**
   * @param {Task} task
   * @returns {AbortablePromise}
   */
  markTaskAsWaiting(task) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/status/waiting`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${task.id}) as waiting.`);
      });
  }

  /**
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise}
   */
  assignUserToTask(task, user) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/user/${user.id}/assign`);

    return this._bufferedHttp.put(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed assigning user (${user.id}) to task (${task.id}).`);
      });
  }

  /**
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise}
   */
  dissociateUserFromTask(task, user) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/user/${user.id}/assign`);

    return this._bufferedHttp.delete(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed dissociating user (${user.id}) from task (${task.id}).`);
      });
  }
}

TaskGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TaskGateway;
