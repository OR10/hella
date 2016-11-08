/**
 * Controller of the {@link ProjectReportListDirective}
 */
class ProjectReportListController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$interval} $interval
   * @param {$state} $state
   * @param {$window} $window
   * @param {ModalService} modalService
   * @param {ProjectGateway} projectGateway
   * @param {ApiService} apiService
   */
  constructor($rootScope, $interval, $state, $window, modalService, projectGateway, apiService) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {$window}
     * @private
     */
    this._$window = $window;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    const intervalInSeconds = 2;

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

  showJSON(projectId, reportId) {
    const url = this._apiService.getApiUrl(`project/${projectId}/report/${reportId}.json`);
    this._$window.open(url);
  }
}

ProjectReportListController.$inject = [
  '$rootScope',
  '$interval',
  '$state',
  '$window',
  'modalService',
  'projectGateway',
  'ApiService',
];

export default ProjectReportListController;
