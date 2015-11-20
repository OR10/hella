import LabeledThing from '../Models/LabeledThing';

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
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const url = this._apiService.getApiUrl(`/task/${labeledThing.taskId}/labeledThing/${labeledThing.id}`);

    return this._bufferedHttp.put(url, labeledThing, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThing(response.data.result);
        }

        throw new Error('Received malformed response when creating labeled thing.');
      });
  }

  /**
   * @param {string} taskId
   * @param {string} labeledThingId
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  getLabeledThing(taskId, labeledThingId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/labeledThing/${labeledThingId}`);

    return this._bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThing(response.data.result);
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
