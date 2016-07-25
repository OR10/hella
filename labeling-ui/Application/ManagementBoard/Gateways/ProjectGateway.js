/**
 * Gateway for requesting projects information
 */
class ProjectGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.bufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    this._bufferedHttp = bufferedHttp;
    this._apiService = apiService;
  }

  /**
   * @returns {Promise<Project>}
   */
  getProject(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}`);

    return this._bufferedHttp.get(url, undefined, 'project')
      .then(response => response.data.result);
  }

  /**
   * @param {'todo'|'in_progress'|'done'} status
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<Array<Project>>}
   */
  getProjects(status, limit = null, offset = null) {
    const params = {
      projectStatus: status,
    };

    if (limit !== null) {
      params.limit = limit;
    }

    if (offset !== null) {
      params.offset = offset;
    }

    const url = this._apiService.getApiUrl('/project', params);

    return this._bufferedHttp.get(url, undefined, 'project')
      .then(response => response.data);
  }

  /**
   * @returns {Promise<Object>}
   */
  getProjectCount() {
    const url = this._apiService.getApiUrl('/projectCount');
    return this._bufferedHttp.get(url, undefined, 'projectcount')
      .then(response => response.data.result);
  }

  /**
   * @returns {Promise<Export>}
   */
  getExports(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/export`);

    return this._bufferedHttp.get(url, undefined, 'export')
      .then(response => response.data.result);
  }

  /**
   * Starts export for the given {@link Project}
   *
   * @param {string} projectId
   * @param {string} exportType
   *
   * @returns {AbortablePromise<string|Error>}
   */
  startExport(projectId, exportType = 'csv') {
    const url = this._apiService.getApiUrl(`/project/${projectId}/export/${exportType}`);

    return this._bufferedHttp.post(url, {}, undefined, 'export')
      .then(response => {
        if (response.data && response.data.message) {
          return response.data.message;
        }

        throw new Error('Failed starting export');
      });
  }

  /**
   * @param {string} projectId
   * @returns {AbortablePromise}
   */
  acceptProject(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/inProgress`);
    return this._bufferedHttp.post(url, undefined, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed accepting project (${projectId}).`);
      });
  }

  /**
   * @param {string} projectId
   * @returns {AbortablePromise}
   */
  closeProject(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/done`);
    return this._bufferedHttp.post(url, undefined, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed closing project (setting to state done): ${projectId}.`);
      });
  }
}

ProjectGateway.$inject = ['ApiService', 'bufferedHttp'];

export default ProjectGateway;
