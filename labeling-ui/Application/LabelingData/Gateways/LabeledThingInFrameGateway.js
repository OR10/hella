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
   * @returns {Promise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.bufferedHttp.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result
            .map(labeledThingInFrame => new LabeledThingInFrame(labeledThingInFrame));
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
  }

  /**
   * Retrieves the {@link LabeledThingInFrame} with the given `id`
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  getLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.bufferedHttp.get(url)
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
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    return this.bufferedHttp.put(url, labeledThingInFrame)
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
   * @returns {Promise<true|Error>}
   */
  deleteLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.bufferedHttp.delete(url)
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
