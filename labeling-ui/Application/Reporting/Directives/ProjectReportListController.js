/**
 * Controller of the {@link ProjectReportListDirective}
 */
class ProjectReportListController {
  /**
   * @param {$state} $state
   * @param {ModalService} modalService
   */
  constructor($state, modalService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;
  }

  openReport(id) {
    const report = this.reports.find(possibleReport => possibleReport.id === id);

    if (report.reportStatus === 'in_progress') {
      const modal = this._modalService.getAlertWarningDialog({
        title: 'Report generation in progress',
        headline: 'This report is still being generated.',
        message: 'The requested report is still being generated for you. Please check back in a few moments, when its ready for consumption.',
        confirmButtonText: 'Understood',
      });
      modal.activate();
      return;
    }

    if (report.reportStatus === 'error') {
      const modal = this._modalService.getAlertWarningDialog(
        {
          title: 'Error',
          headline: 'There was an error generating the report',
          message: 'There was an error while generating the report for this project.',
          confirmButtonText: 'Understood',
        }
      );
      modal.activate();
      return;
    }

    this._$state.go(
      'labeling.reporting.show',
      {
        projectId: report.projectId,
        reportId: report.id,
      }
    );
  }
}

ProjectReportListController.$inject = [
  '$state',
  'modalService',
];

export default ProjectReportListController;
