/**
 * Controller of the {@link ExportListDirective}
 */
class ExportListController {
  /**
   * @param {ApiService} ApiService injected
   */
  constructor(ApiService) {
    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this.apiService = ApiService;
  }

  /**
   * Generate downloadUrl for a specific task
   *
   * @param {string} taskId
   * @param {string} exportId
   * @returns {string}
   */
  downloadUrl(taskId, exportId) {
    return this.apiService.getApiUrl(
      `/task/${taskId}/export/${exportId}`
    );
  }
}

ExportListController.$inject = [
  'ApiService',
];

export default ExportListController;
