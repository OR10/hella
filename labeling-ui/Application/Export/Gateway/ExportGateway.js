/**
 * Gateway for retrieving {@link Export}s
 */
class ExportGateway {
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
   * Retrieves a list of available {@link Export}s for the given {@link Task}
   *
   * @return {AbortablePromise<Export[]|Error>}
   */
  getTaskExports(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/export`);
    return this._bufferedHttp.get(url, undefined, 'export')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading export list');
      });
  }

  /**
   * Starts export for the given {@link Task} and export type
   *
   * @param {string} taskId
   * @param {string} type
   * @returns {AbortablePromise<string|Error>}
   */
  startExport(taskId, type) {
    const exportType = type || 'kitti';
    const url = this._apiService.getApiUrl(`/task/${taskId}/export/${exportType}`);
    return this._bufferedHttp.post(url, {}, undefined, 'export')
      .then(response => {
        if (response.data && response.data.message) {
          return response.data.message;
        }

        throw new Error('Failed starting export');
      });
  }
}

ExportGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default ExportGateway;
