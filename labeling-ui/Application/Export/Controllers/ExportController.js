/**
 * Controller for the export entrypoint route
 */
class ExportController {
  constructor(task, exportGateway) {
    this.task = task;
    this.exportGateway = exportGateway;
  }

  /**
   * Starts a new export for the given task
   */
  handleStartExportClicked() {
    this.exportGateway.startExport(this.task.id, undefined);
  }
}

ExportController.$inject = [
  'task',
  'exportGateway',
];

export default ExportController;
