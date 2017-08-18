/**
 * Gateway for requesting projects information
 */
class ProjectGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.bufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, organisationService) {
    /**
     * @type {angular.bufferedHttp}
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
   * @returns {Promise<Project>}
   */
  getProject(projectId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}`);

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

    const organisationId = this._organisationService.get();

    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project`, params);

    return this._bufferedHttp.get(url, undefined, 'project')
      .then(response => response.data);
  }

  /**
   * @returns {Promise<Object>}
   */
  getProjectCount() {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/projectCount`);

    return this._bufferedHttp.get(url, undefined, 'projectcount')
      .then(response => response.data.result);
  }

  /**
   * @returns {Promise<Export>}
   */
  getExports(projectId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/export`);

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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/export/${exportType}`);

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
   * @param {string} groupId
   * @returns {AbortablePromise}
   */
  acceptProject(projectId, groupId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/status/accept`);
    return this._bufferedHttp.post(url, {assignedGroupId: groupId}, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed accepting project (${projectId}).`);
      });
  }

  /**
   * @param {string} projectId
   * @param {string} groupId
   * @returns {AbortablePromise}
   */
  changeLabelGroupAssignment(projectId, groupId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/assignLabelGroup`);
    return this._bufferedHttp.post(url, {labelGroupId: groupId}, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed changing the label-group for project  (${projectId}).`);
      });
  }

  /**
   * @param {string} projectId
   * @param {string} labelManagerId
   * @returns {AbortablePromise}
   */
  assignLabelManager(projectId, labelManagerId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/assign`);
    return this._bufferedHttp.post(url, {assignedLabelManagerId: labelManagerId}, undefined, 'project')
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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/status/done`);
    return this._bufferedHttp.post(url, undefined, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed closing project (setting to state done): ${projectId}.`);
      });
  }

  /**
   * @param {string} projectId
   * @returns {AbortablePromise}
   */
  setProjectStatusToDeleted(projectId, message) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/status/deleted`);
    return this._bufferedHttp.post(url, {message}, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result && response.data.result.success === true) {
          return response.data.result;
        }

        throw new Error(`Failed to set delete status for project: ${projectId}.`);
      });
  }

  /**
   * @param {string} projectId
   * @returns {AbortablePromise}
   */
  deleteProject(projectId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project/${projectId}/delete`);
    return this._bufferedHttp.post(url, {}, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result && response.data.result.success === true) {
          return response.data.result;
        }

        throw new Error(`Failed to delete project: ${projectId}.`);
      });
  }

  /**
   * @param {Object} data
   * @returns {*}
   */
  createProject(data) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/project`);
    return this._bufferedHttp.post(url, data, undefined, 'project')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed creating the project`);
      });
  }
}

ProjectGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  'organisationService',
];

export default ProjectGateway;
