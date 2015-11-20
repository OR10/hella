import LabeledThingInFrame from '../Models/LabeledThingInFrame';

/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class LabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     */
    this.bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameNumber`
   *
   * @param {Task} task
   * @param {Integer} frameNumber
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result
            .map(labeledThingInFrame => new LabeledThingInFrame(labeledThingInFrame));
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
  }

  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameNumber`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameNumber`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param task
   * @param frameNumber
   * @param labeledThingId
   * @param offset
   * @param limit
   */
  getLabeledThingInFrame(task, frameNumber, labeledThingId, offset = 0, limit = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}/${labeledThingId}`,
      {offset, limit}
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result
            .map(labeledThingInFrame => new LabeledThingInFrame(labeledThingInFrame));
        }

        throw new Error('Failed loading labeled thing in frame');
      });
  }

  /**
   * Retrieves the {@link LabeledThingInFrame} with the given `id`
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  getLabeledThingInFrameById(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingInFrame(response.data.result);
        }

        throw new Error('Failed loading labeled thing in frame');
      });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    return this.bufferedHttp.put(url, labeledThingInFrame, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingInFrame(response.data.result);
        }

        throw new Error('Failed updating labeled thing in frame');
      });
  }

  /**
   * Deletes the {@link LabeledThingInFrame} in the database
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {AbortablePromise<true|Error>}
   */
  deleteLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.bufferedHttp.delete(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data) {
          return true;
        }

        throw new Error('Failed deleting labeled thing in frame');
      });
  }
}

LabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabeledThingInFrameGateway;
