/**
 * A Service providing access to the release configuration
 */
class ReleaseConfigService {
  constructor($http, $q, apiService) {
    this._$http = $http;
    this._$q = $q;

    this._url = apiService.getFrontendUrl('/Library/release.config.json');

    this._releaseConfig = null;
  }

  getReleaseConfig() {
    if (this._releaseConfig !== null) {
      return this._$q.resolve(this._releaseConfig);
    }

    return this._$http.get(this._url).then(
      response => { // success
        this._releaseConfig = response.data;
      }
    ).then(
      () => this._releaseConfig
    );
  }
}

ReleaseConfigService.$inject = ['$http', '$q', 'ApiService'];

export default ReleaseConfigService;
