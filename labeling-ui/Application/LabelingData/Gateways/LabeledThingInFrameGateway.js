import LabeledThingInFrame from '../Models/LabeledThingInFrame';

/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class LabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {$q} $q
   * @param {LabeledThingGateway} labeledThingGateway
   */
  constructor(apiService, bufferedHttp, $q, labeledThingGateway) {
    /**
     * @type {BufferedHttp}
     */
    this.bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;

    /**
     * @type {$q}
     */
    this._$q = $q;

    this._labeledThingGateway = labeledThingGateway;
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
          return this._associateWithLabeledThings(task, response.data.result)
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
   * @param {Task} task
   * @param {int} frameNumber
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameNumber, labeledThing, offset = 0, limit = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}/${labeledThing.id}`,
      {offset, limit}
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return this._associateWithLabeledThings(task, response.data.result);
        }

        throw new Error('Failed loading labeled thing in frame');
      });
  }

  /**
   * Retrieve the corresponding {@link LabeledThing}s for each given `labeledThingInFrame`
   *
   * After the {@link LabeledThing} is Retrieved it will be combined into a new {@link LabeledThingInFrame}
   *
   * @param {Task} task
   * @param {Object} labeledThingsInFrameData
   * @returns {Promise.<Array.<LabeledThingInFrame>>}
   * @private
   */
  _associateWithLabeledThings(task, labeledThingsInFrameData) {
    return this._$q.all(
      labeledThingsInFrameData.map(
        data => this._labeledThingGateway.getLabeledThing(task, data.labeledThingId))
      )
      .then(labeledThings => {
        return labeledThingsInFrameData.map(
          (data, index) => new LabeledThingInFrame(
            Object.assign({}, data, {labeledThing: labeledThings[index]})
          )
        );
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
    if (labeledThingInFrame.ghost === true) {
      return this._$q.reject(
        new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!')
      );
    }

    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    return this.bufferedHttp.put(url, labeledThingInFrame, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingInFrame(Object.assign({}, response.data.result, labeledThingInFrame.labeledThing));
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
  '$q',
  'labeledThingGateway',
];

export default LabeledThingInFrameGateway;
