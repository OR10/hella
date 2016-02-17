/**
 * Interpolation base class, for all {@link Interpolation}s, which are executed on the backend
 *
 * @implements Interpolation
 * @abstract
 */
class BackendInterpolation {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {StatusGateway} statusGateway
   */
  constructor(apiService, bufferedHttp, statusGateway) {
    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {StatusGateway}
     * @private
     */
    this._statusGateway = statusGateway;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   */
  execute(task, labeledThing, frameRange) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/interpolate/${labeledThing.id}`
    );

    const data = {
      offset: frameRange.startFrameNumber - labeledThing.frameRange.startFrameNumber,
      limit: frameRange.endFrameNumber - frameRange.startFrameNumber + 1,
      type: this._getRemoteType(),
    };

    return this._bufferedHttp.post(url, data, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed initiating interpolation`);
      })
      .then(job => this._statusGateway.waitForJob(job, 500));
  }

  /**
   * Retrieve the type to be used on the remote backend for this interpolation
   *
   * @protected
   * @abstract
   */
  _getRemoteType() {
    throw new Error('Abstract method not overridden: BackendInterpolation#_getRemoteType');
  }
}

BackendInterpolation.$inject = [
  'ApiService',
  'bufferedHttp',
  'statusGateway',
];

export default BackendInterpolation;
