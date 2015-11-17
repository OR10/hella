/**
 * Controller of the {@link ExportListDirective}
 */
class ExportListController {
  /**
   * @param {ExportGateway} exportGateway injected
   */
  constructor(exportGateway) {
    /**
     * List of exports rendered by the directive
     * @type {null|Array.<Export>}
     */
    this.exports = null;

    /**
     * @type {ExportGateway}
     * @private
     */
    this._exportGateway = exportGateway;

    this._loadExportList();
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

ExportListController.$inject = ['exportGateway'];

export default ExportListController;
