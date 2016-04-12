/**
 * Gateway for requesting projects information
 */
class ProjectGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.$http} $http
   */
  constructor(apiService, $http) {
    this._$http = $http;
    this._apiService = apiService;
  }

  /**
   * @returns {Promise<Array<Project>>}
   */
  getProjects() {
    const url = this._apiService.getApiUrl('/project');

    return this._$http.get(url)
      .then(response => response.data.result);
  }
}

ProjectGateway.$inject = ['ApiService', '$http'];

export default ProjectGateway;