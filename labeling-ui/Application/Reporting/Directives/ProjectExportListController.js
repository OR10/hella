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
   */
  constructor($rootScope, $interval, ApiService, projectGateway, organisationService) {
    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this._apiService = ApiService;

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
      `/organisation/${organisationId}/project/${taskId}/export/${exportId}`
    );
  }
}

ProjectExportListController.$inject = [
  '$rootScope',
  '$interval',
  'ApiService',
  'projectGateway',
  'organisationService',
];

export default ProjectExportListController;
