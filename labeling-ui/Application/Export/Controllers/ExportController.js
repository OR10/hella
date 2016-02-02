/**
 * Controller for the export entrypoint route
 */
class ExportController {
  constructor(task, user, exportGateway) {
    this.task = task;
    this.user = user;
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
  'user',
  'exportGateway',
];

export default ExportController;
