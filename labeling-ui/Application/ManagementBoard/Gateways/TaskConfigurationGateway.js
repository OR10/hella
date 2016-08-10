import angular from 'angular';

/**
 * Gateway for managing Task Configuration information
 */
class TaskConfigurationGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {angular.$q} $q
   */
  constructor(apiService, bufferedHttp, $q) {
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

    this._$q = $q;
  }

  /**
   * Upload and create new TaskConfiguration
   *
   * @return {AbortablePromise<TaskConfiguration|Error>}
   */
  uploadTaskConfiguration(name, file) {
    const url = this._apiService.getApiUrl('/taskConfiguration');

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
          return this._$q.reject(response.data.error);
        }
        return this._$q.reject('Failed uploading new task configuration');
      });
  }
}

TaskConfigurationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
];

export default TaskConfigurationGateway;
