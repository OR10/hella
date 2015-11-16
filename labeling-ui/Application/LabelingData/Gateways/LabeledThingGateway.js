import uuid from 'uuid';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s
 */
class LabeledThingGateway {
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
   * @param {LabeledThing} labeledThing
   * @returns {Promise.<LabeledThing|Error>}
   * @private
   */
  saveLabeledThing(labeledThing) {
    const url = this._apiService.getApiUrl(`/task/${labeledThing.taskId}/labeledThing/${labeledThing.id}`);

    return this._bufferedHttp.put(url, labeledThing)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Received malformed response when creating labeled thing.');
      });
  }

  /**
   * @param {string} taskId
   * @param {string} labeledThingId
   * @returns {Promise.<LabeledThing|Error>}
   */
  getLabeledThing(taskId, labeledThingId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/labeledThing/${labeledThingId}`);

    return this._bufferedHttp.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Received malformed response when requesting labeled thing.');
      });
  }
}

LabeledThingGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabeledThingGateway;
