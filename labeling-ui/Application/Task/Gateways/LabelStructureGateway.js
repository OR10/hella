/**
 * Gateway for retrieving the labeling data structure of a task
 */
class LabelStructureGateway {
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
   * Retrieves the task structure information for the given id of a {@link Task}
   *
   * @param {string} taskConfigurationId
   *
   * @return {AbortablePromise}
   */
  getTaskStructureData(taskConfigurationId) {
    const url = this._apiService.getApiUrl(`/taskConfiguration/${taskConfigurationId}`);
    return this._bufferedHttp.get(url, undefined, 'label-structure')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading the task structure data with id: ${taskConfigurationId}`);
      });
  }

  /**
   * Retrieves the requirements file for the given id of a {@link Task}
   *
   * @param {string} taskConfigurationId
   */
  getRequirementsFile(taskConfigurationId) {
    const url = this._apiService.getApiUrl(`/taskConfiguration/${taskConfigurationId}/file`);
    return this._bufferedHttp.get(url, undefined, 'label-structure')
      .then(response => {
        if (response) {
          return response;
        }

        throw new Error(`Failed loading requirements file for task configuration id: ${taskConfigurationId}`);
      });
  }

  /**
   * Retrieves the {@link Task} identified by the given `id`
   *
   * @param {string} taskId
   *
   * @return {AbortablePromise.<Task|Error>}
   */
  getLabelStructureData(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/labelStructure`);
    return this._bufferedHttp.get(url, undefined, 'label-structure')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${taskId}`);
      });
  }
}

LabelStructureGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabelStructureGateway;
