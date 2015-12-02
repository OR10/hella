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
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {StatusGateway} statusGateway
   */
  constructor(apiService, bufferedHttp, labeledThingGateway, statusGateway) {
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
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {StatusGateway}
     * @private
     */
    this._statusGateway = statusGateway;
  }

  /**
   * @param {string} taskId
   * @param {string} labeledThingId
   * @param {FrameRange} frameRange
   */
  execute(taskId, labeledThingId, frameRange) {
    return this._labeledThingGateway.getLabeledThing(taskId, labeledThingId)
      .then(labeledThing => {
        const url = this._apiService.getApiUrl(
          `/task/${taskId}/interpolate/${labeledThingId}`
        );

        const data = {
          offset: frameRange.startFrameNumber - labeledThing.frameRange.startFrameNumber,
          limit: frameRange.endFrameNumber - frameRange.startFrameNumber + 1,
          type: this._getRemoteType(),
        };

        return this._bufferedHttp.post(url, data, undefined, 'interpolate');
      })
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
  'labeledThingGateway',
  'statusGateway',
];

export default BackendInterpolation;
