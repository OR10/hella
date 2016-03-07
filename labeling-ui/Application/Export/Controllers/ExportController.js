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
  handleStartKittiExportClicked() {
    this.exportGateway.startExport(this.task.id, 'kitti');
  }

  handleStartCsvExportClicked() {
    this.exportGateway.startExport(this.task.id, 'csv');
  }
}

ExportController.$inject = [
  'task',
  'user',
  'exportGateway',
];

export default ExportController;
