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
   * Retrieves a list of available {@link Task}s and their associated videos for a certain project
   *
   * @return {AbortablePromise<{taskTypes: TaskTypes, videos: Object<string, Video>}|Error>}
   */
  getTasksForProject(projectId, status, limit = null, offset = null) {
    const params = {
      project: projectId,
      taskStatus: status,
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
        if (!response.data) {
          throw new Error('Failed loading task list');
        }

        return response.data;
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
   * Retrieves the number of tasks of a project for each category
   *
   * - labeling
   *   - todo
   *   - in_progress
   *   - done
   *   - ...
   * - review
   *   - ...
   * - revision
   *   - ...
   *
   * @param {string} projectId
   *
   * @return {AbortablePromise.<Object|Error>}
   */
  getTaskCount(projectId) {
    const url = this._apiService.getApiUrl(`/taskCount/${projectId}`);
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading taskCount for project ${projectId}`);
      });
  }

  /**
   * @param {string} taskId
   * @returns {AbortablePromise}
   */
  markTaskAsDone(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/status/done`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${taskId}) as labeled.`);
      });
  }

  /**
   * @param {string} taskId
   * @returns {AbortablePromise}
   */
  markTaskAsTodo(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/status/todo`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${taskId}) as waiting.`);
      });
  }

  /**
   * @param {string} taskId
   * @returns {AbortablePromise}
   */
  markTaskAsInProgress(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/status/in_progress`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${taskId}) as in_progress.`);
      });
  }

  /**
   * @param {string} taskId
   * @returns {AbortablePromise}
   */
  reopenTask(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/status/reopen`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task (${taskId}) as reopen.`);
      });
  }

  /**
   * @param {taskId} taskId
   * @returns {AbortablePromise}
   */
  assignAndMarkAsInProgress(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/status/begin`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed assigning and marking task (${taskId}) as in_progress.`);
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
   * @param {Task} taskId
   * @param {User} userId
   * @returns {AbortablePromise}
   */
  unassignUserFromTask(taskId, userId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/user/${userId}/assign`);

    return this._bufferedHttp.delete(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed dissociating user (${userId}) from task (${taskId}).`);
      });
  }
}

TaskGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default TaskGateway;
