import Task from '../Model/Task';
import User from 'Application/ManagementBoard/Models/User';
import TaskReplicationInformation from '../Model/TaskReplicationInformation';

/**
 * Gateway for retrieving information about Tasks
 */
class TaskGateway {
  /**
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor($q,
              loggerService,
              apiService,
              bufferedHttp,
              organisationService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = loggerService;

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
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;
  }

  /**
   * Retrieves a list of available {@link Task}s and their associated videos for a certain project
   *
   * @param {string} projectId
   * @param {string} phase
   * @param {string} status
   * @param {number?} limit
   * @param {number?} offset
   * @return {AbortablePromise<{taskTypes: TaskTypes, videos: Object<string, Video>}|Error>}
   */
  getTasksForProjectWithPhaseAndStatus(projectId, phase, status, limit = null, offset = null) {
    const params = {
      project: projectId,
      taskStatus: status,
      phase,
    };

    if (limit) {
      params.limit = limit;
    }

    if (offset) {
      params.offset = offset;
    }

    const url = this._apiService.getApiUrl('/v1/task', params);

    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (
          response.data !== undefined &&
          response.data.totalRows !== undefined &&
          response.data.result !== undefined &&
          response.data.result.tasks !== undefined &&
          response.data.result.users !== undefined
        ) {
          const users = {};
          Object.keys(response.data.result.users).forEach(userId => users[userId] = new User(response.data.result.users[userId]));
          return {
            totalRows: response.data.totalRows,
            tasks: response.data.result.tasks.map(task => new Task(task, users)),
          };
        }

        throw new Error('Failed loading task list');
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
    const url = this._apiService.getApiUrl(`/v1/task/${id}`);
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result && response.data.result.task && response.data.result.users) {
          const users = {};
          Object.keys(response.data.result.users).forEach(userId => users[userId] = new User(response.data.result.users[userId]));
          return new Task(response.data.result.task, users);
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
    const url = this._apiService.getApiUrl(`/v1/taskCount/${projectId}`);
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
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/status/done`);
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
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/status/todo`);
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
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/status/in_progress`);
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
   * @param {string} phase
   * @returns {AbortablePromise}
   */
  reopenTask(taskId, phase) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/status/reopen`);
    return this._bufferedHttp.post(url, {phase}, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed marking task ${taskId} for phase ${phase} as reopen.`);
      });
  }

  /**
   * @param {taskId} taskId
   * @returns {AbortablePromise}
   */
  assignAndMarkAsInProgress(taskId) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/status/begin`);
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
    const url = this._apiService.getApiUrl(`/v1/task/${task.id}/user/${user.id}/assign`);

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
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/user/${userId}/assign`);

    return this._bufferedHttp.delete(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed dissociating user (${userId}) from task (${taskId}).`);
      });
  }

  /**
   * @param {string} projectId
   * @param {number?} limit
   * @param {number?} offset
   */
  getFlaggedTasks(projectId, limit = null, offset = null) {
    const params = {};

    if (limit) {
      params.limit = limit;
    }

    if (offset) {
      params.offset = offset;
    }

    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisationId}/project/${projectId}/attentionTasks`, params);

    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (
          response.data !== undefined &&
          response.data.totalRows !== undefined &&
          response.data.result !== undefined &&
          response.data.result.tasks !== undefined &&
          response.data.result.users !== undefined
        ) {
          const users = {};
          Object.keys(response.data.result.users).forEach(userId => users[userId] = new User(response.data.result.users[userId]));
          return {
            totalRows: response.data.totalRows,
            tasks: response.data.result.tasks.map(task => new Task(task, users)),
          };
        }

        throw new Error('Failed loading flagged task list');
      });
  }

  /**
   * @param {String} taskId
   * @return {*}
   */
  flagTask(taskId) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/attention/enable`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result && response.data.result.success === true) {
          return response.data.result;
        }

        throw new Error(`Failed to flag task: ${taskId}.`);
      });
  }

  /**
   * @param {String} taskId
   * @return {*}
   */
  unflagTask(taskId) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/attention/disable`);
    return this._bufferedHttp.post(url, undefined, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result && response.data.result.success === true) {
          return response.data.result;
        }

        throw new Error(`Failed to unflag task: ${taskId}.`);
      });
  }

  moveTaskToPhase(taskId, phase) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/phase`);

    return this._bufferedHttp.put(url, {phase}, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result && response.data.result.success === true) {
          return response.data.result;
        }

        throw new Error(`Failed to move task (${taskId}) to phase: ${phase}.`);
      });
  }

  /**
   * Request information about the CouchDb-Endpoint to replicate information for a specific task
   *
   * @param {string} taskId
   * @return {Promise.<TaskReplicationInformation>}
   */
  getTaskReplicationInformationForTaskId(taskId) {
    const url = this._apiService.getApiUrl(`/v1/task/${taskId}/replication`);

    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return new TaskReplicationInformation(
            response.data.result
          );
        }

        throw new Error(`Failed to load TaskReplicationInformation for task ${taskId}.`);
      });
  }

}

TaskGateway.$inject = [
  '$q',
  'loggerService',
  'ApiService',
  'bufferedHttp',
  'organisationService',
];

export default TaskGateway;
