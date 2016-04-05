import LabeledFrame from '../Models/LabeledFrame';

/**
 * Gateway for saving and retrieving {@link LabeledFrame}s
 */
class LabeledFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;
  }


  /**
   * Returns the {@link LabeledFrame} for the given `taskId` and `frameIndex`
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  getLabeledFrame(taskId, frameIndex) {
    const url = this._apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameIndex}`
    );
    return this._bufferedHttp.get(url, undefined, 'labeledFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledFrame(response.data.result);
        }

        throw new Error('Failed loading labeled frame');
      });
  }


  /**
   * Updates the labeled frame for the given task and frame number in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   * @param {LabeledFrame} labeledFrame
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  saveLabeledFrame(taskId, frameIndex, labeledFrame) {
    const url = this._apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameIndex}`
    );

    return this._bufferedHttp.put(url, labeledFrame, undefined, 'labeledFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledFrame(response.data.result);
        }

        throw new Error('Failed updating labeled frame');
      });
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<Boolean|Error>}
   */
  deleteLabeledFrame(taskId, frameIndex) {
    const url = this._apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameIndex}`
    );
    return this._bufferedHttp.delete(url, undefined, 'labeledFrame')
      .then(response => {
        if (response.data) {
          return true;
        }

        throw new Error('Failed deleting labeled thing in frame');
      });
  }
}

LabeledFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabeledFrameGateway;
