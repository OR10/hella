/**
 * Controller of the {@link ExportListDirective}
 */
class ExportListController {
  /**
   * @param {ExportGateway} exportGateway injected
   * @param {ApiService} ApiService injected
   */
  constructor(exportGateway, ApiService) {
    /**
     * List of exports rendered by the directive
     * @type {null|Array.<Export>}
     */
    this.exports = null;

    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this.apiService = ApiService;

    /**
     * @type {ExportGateway}
     * @private
     */
    this._exportGateway = exportGateway;

    this._loadExportList();
  }

  /*
  TODO: This function gets called ~5 times per usage in the directive.
  This should be considered later on with more exports!
   */
  downloadUrl(taskId, exportId) {
    return this.apiService.getApiUrl(
      `/task/${taskId}/export/${exportId}`
    );
  }

  /**
   * Retrieve a fresh list of {@link Export} objects from the backend.
   *
   * Once the retrieval operation is finished the {@link ExportListController#exports} will be automatically updated
   * to the new list.
   *
   * @private
   */
  _loadExportList() {
    this._exportGateway.getTaskExports(this.task.id)
      .then((exports) => {
        this.exports = exports;
      });
  }
}

ExportListController.$inject = ['exportGateway', 'ApiService'];

export default ExportListController;
