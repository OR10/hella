/**
 * Controller of the {@link ExportListDirective}
 */
class ProjectExportListController {
  /**
   * @param {$rootScope} $rootScope
   * @param {$interval} $interval
   * @param {ApiService} ApiService injected
   * @param {ProjectGateway} projectGateway
   */
  constructor($rootScope, $interval, ApiService, projectGateway) {
    /**
     * The api service for building urls
     * @type {ApiService}
     */
    this.apiService = ApiService;

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
    return this.apiService.getApiUrl(
      `/project/${taskId}/export/${exportId}`
    );
  }
}

ProjectExportListController.$inject = [
  '$rootScope',
  '$interval',
  'ApiService',
  'projectGateway',
];

export default ProjectExportListController;
