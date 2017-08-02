/**
 * Controller of the {@link ExportListDirective}
 */
class ProjectExportListController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$interval} $interval
   * @param {ApiService} ApiService injected
   * @param {ProjectGateway} projectGateway
   * @param {OrganisationService} organisationService
   * @param {ModalService} modalService
   */
  constructor($rootScope, $interval, ApiService, projectGateway, organisationService, modalService) {
    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this._apiService = ApiService;

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

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

  /**
   * Generate downloadUrl for a specific task
   *
   * @param {string} taskId
   * @param {string} exportId
   * @returns {string}
   */
  downloadUrl(taskId, exportId) {
    const organisationId = this._organisationService.get();

    return this._apiService.getApiUrl(
      `/v1/organisation/${organisationId}/project/${taskId}/export/${exportId}`
    );
  }

  /**
   * Show a warning Model
   *
   * @param warningMessage
   */
  showWarningModal(warningMessage) {
    this._modalService.info(
      {
        title: 'Warning',
        headline: 'Some warnings occurred during export generation.',
        message: warningMessage,
        confirmButtonText: 'Understood',
      },
      undefined,
      undefined,
      {
        abortable: false,
      }
    );
  }

  /**
   * Show a error Model
   *
   * @param errorMessage
   */
  showErrorModal(errorMessage) {
    this._modalService.info(
      {
        title: 'Error',
        headline: 'Some errors occurred during export generation.',
        message: errorMessage,
        confirmButtonText: 'Understood',
      },
      undefined,
      undefined,
      {
        abortable: false,
      }
    );
  }
}

ProjectExportListController.$inject = [
  '$rootScope',
  '$interval',
  'ApiService',
  'projectGateway',
  'organisationService',
  'modalService',
];

export default ProjectExportListController;
