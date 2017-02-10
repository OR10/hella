/**
 * Gateway for requesting upload information
 */
class UploadGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.bufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    this._bufferedHttp = bufferedHttp;
    this._apiService = apiService;
  }

  markUploadAsFinished(path) {
    const url = this._apiService.getApiUrl(path);

    return this._bufferedHttp.post(url, undefined, undefined, 'upload')
      .then(
        response => {
          if (response.data && response.data.result) {
            return response.data.result;
          }

          throw new Error(`Failed marking the upload as complete`);
        }
      );
  }

  getApiUrl(path) {
    return this._apiService.getApiUrl(path);
  }
}

UploadGateway.$inject = ['ApiService', 'bufferedHttp'];

export default UploadGateway;
