/**
 * Gateway for managing project reports
 */
class ReportGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
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
  }

  /**
   * Start a new report
   *
   * @return {AbortablePromise<Object|Error>}
   */
  startReport(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/report`);
    return this._bufferedHttp.post(url, undefined, undefined, 'report')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed starting a new report');
      });
  }

  /**
   * Get all reports for the given project
   *
   * @return {AbortablePromise<Object|Error>}
   */
  getReports(projectId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/report`);
    return this._bufferedHttp.get(url, undefined, 'report')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading reports for project (${projectId})`);
      });
  }

  /**
   * Get a single report
   *
   * @return {AbortablePromise<Object|Error>}
   */
  getReport(projectId, reportId) {
    const url = this._apiService.getApiUrl(`/project/${projectId}/report/${reportId}`);
    return this._bufferedHttp.get(url, undefined, 'report')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading report (${reportId})`);
      });
  }
}

ReportGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default ReportGateway;
