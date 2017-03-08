import angular from 'angular';

/**
 * Gateway for managing Task Configuration information
 */
class TaskConfigurationGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {angular.$q} $q
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, $q, organisationService) {
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
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;
  }

  /**
   * Upload and create new TaskConfiguration
   *
   * @return {AbortablePromise<RequirementsConfiguration|Error>}
   */
  uploadRequirementsConfiguration(name, file) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/taskConfiguration/requirements`);

    return this._uploadConfiguration(url, name, file);
  }

  /**
   * Upload and create new Configuration file
   *
   * @param {string} url
   * @param {string} name
   * @param {File} file
   * @return {AbortablePromise}
   * @private
   */
  _uploadConfiguration(url, name, file) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);

    return this._bufferedHttp.post(
      url,
      formData,
      {
        // Do not serialize formdata
        transformRequest: angular.identity,
        // Set to multipart/form-data with correct boundary
        headers: {
          'Content-Type': undefined,
        },
      },
      'task-configuration'
    )
      .then(response => {
        if (response.data && response.data.result) {
          // return new TaskConfiguration(response.data.result);
          return response.data.result;
        }

        throw new Error('Failed uploading new task configuration');
      })
      .catch(response => {
        if (response.data && response.data.error) {
          return this._$q.reject({code: response.status, message: response.data.error});
        }
        return this._$q.reject('Failed uploading new task configuration');
      });
  }

  /**
   * Get all configurations the current users has created
   *
   * @returns {AbortablePromise}
   */
  getRequirementsXmlConfigurations() {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/taskConfiguration?type=requirementsXml`);

    return this._bufferedHttp.get(url, undefined, 'task-configuration').then(response => {
      if (response.data && response.data.result) {
        // return new TaskConfiguration(response.data.result);
        return response.data.result;
      }
    });
  }
}

TaskConfigurationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'organisationService',
];

export default TaskConfigurationGateway;
