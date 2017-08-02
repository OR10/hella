/**
 * Gateway for managing project reports
 */
class ReportGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, organisationService) {
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
   * Start a new report
   *
   * @return {AbortablePromise<Object|Error>}
   */
  startReport(projectId) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisationId}/project/${projectId}/report`);
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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisationId}/project/${projectId}/report`);
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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisationId}/project/${projectId}/report/${reportId}`);
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
  'organisationService',
];

export default ReportGateway;
