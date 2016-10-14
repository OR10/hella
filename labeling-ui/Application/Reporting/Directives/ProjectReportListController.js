/**
 * Controller of the {@link ProjectReportListDirective}
 */
class ProjectReportListController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$interval} $interval
   * @param {$state} $state
   * @param {ModalService} modalService
   * @param {ProjectGateway} projectGateway
   */
  constructor($rootScope, $interval, $state, modalService, projectGateway) {
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

    const intervalInSeconds = 10;

    const intervalPromise = $interval(() => {
      projectGateway.getExports(this.project.id).then(data => {
        this.exports = data;
      });
    }, 1000 * intervalInSeconds);

    $rootScope.$on('$stateChangeStart',
      () => {
        $interval.cancel(intervalPromise);
      });
  }

  openReport(id) {
    const report = this.reports.find(possibleReport => possibleReport.id === id);

    if (report.reportStatus === 'in_progress') {
      this._modalService.info(
        {
          title: 'Report generation in progress',
          headline: 'This report is still being generated.',
          message: 'The requested report is still being generated for you. Please check back in a few moments, when its ready for consumption.',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          abortable: false,
        }
      );
      return;
    }

    if (report.reportStatus === 'error') {
      this._modalService.info(
        {
          title: 'Error',
          headline: 'There was an error generating the report',
          message: 'There was an error while generating the report for this project.',
          confirmButtonText: 'Understood',
        },
        undefined,
        undefined,
        {
          warning: true,
          abortable: false,
        }
      );
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
  '$rootScope',
  '$interval',
  '$state',
  'modalService',
  'projectGateway',
];

export default ProjectReportListController;
