/**
 * Controller for the export entrypoint route
 */
class ExportController {
  /**
   * @param {Task} task
   * @param {User} user
   * @param {ExportGateway} exportGateway
   * @param {ModalService} modalService
   */
  constructor(task, user, exportGateway, modalService) {
    /**
     * @type {Task}
     */
    this.task = task;

    /**
     * @type {User}
     */
    this.user = user;

    /**
     * @type {Array.<Object>}
     */
    this.exports = [];

    /**
     * @type {boolean}
     */
    this.loadingInProgress = false;

    /**
     * @type {ExportGateway}
     * @private
     */
    this._exportGateway = exportGateway;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    this._loadExportList();
  }

  /**
   * Start an export in a given format
   *
   * @param {string} exportFormat
   */
  startExport(exportFormat) {
    this._exportGateway.startExport(this.task.id, exportFormat).then(() => {
      const modal = this._modalService.getInfoDialog({
        title: 'Export in progress',
        headline: 'The requested Export operation has been triggered',
        message: `The requested export to "${exportFormat}" has been triggered. It will be processed and should be available in this view shortly.`,
        confirmButtonText: 'Understood',
        cancelButtonText: false,
      }, () => {
        this._loadExportList();
      });
      modal.activate();
    });
  }

  /**
   * Retrieve a fresh list of {@link Export} objects from the backend.
   *
   * @private
   */
  _loadExportList() {
    this.loadingInProgress = true;
    this._exportGateway.getTaskExports(this.task.id)
      .then(exports => {
        this.exports = exports;
        this.loadingInProgress = false;
      });
  }
}

ExportController.$inject = [
  'task',
  'user',
  'exportGateway',
  'modalService',
];

export default ExportController;
