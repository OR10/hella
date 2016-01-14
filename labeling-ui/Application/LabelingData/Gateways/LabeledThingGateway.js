import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s
 */
class LabeledThingGateway {
  /**
   * @param {ApiService} apiService
   * @param {RevisionManager} revisionManager
   * @param {BufferedHttp} bufferedHttp
   * @param {DataContainer} labeledThingData
   * @param {LabeledThingInFrameDataContainer} labeledThingInFrameData
   */
  constructor(apiService, revisionManager, bufferedHttp, labeledThingData, labeledThingInFrameData) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {DataContainer}
     * @private
     */
    this._labeledThingData = labeledThingData;

    /**
     * @type {LabeledThingInFrameDataContainer}
     * @private
     */
    this._labeledThingInFrameData = labeledThingInFrameData;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const url = this._apiService.getApiUrl(`/task/${labeledThing.task.id}/labeledThing/${labeledThing.id}`);

    this._labeledThingData.invalidate(labeledThing.id);
    this._labeledThingInFrameData.invalidateLabeledThing(labeledThing);

    return this._bufferedHttp.put(url, labeledThing, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThing(Object.assign({}, response.data.result, {task: labeledThing.task}));
        }

        throw new Error('Received malformed response when creating labeled thing.');
      });
  }

  /**
   * @param {Task} task
   * @param {string} labeledThingId
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  getLabeledThing(task, labeledThingId) {
    const url = this._apiService.getApiUrl(`/task/${task.id}/labeledThing/${labeledThingId}`);

    return this._bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThing(Object.assign({}, response.data.result, {task}));
        }

        throw new Error('Received malformed response when requesting labeled thing.');
      });
  }

  /**
   * Delete a {@link LabeledThing} and all its descending {@link LabeledThingInFrame} objects
   *
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise}
   */
  deleteLabeledThing(labeledThing) {
    const url = this._apiService.getApiUrl(
      `/task/${labeledThing.task.id}/labeledThing/${labeledThing.id}`,
      {
        rev: this._revisionManager.getRevision(labeledThing.id),
      }
    );

    return this._bufferedHttp.delete(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.success === true) {
          return true;
        }

        throw new Error('Received malformed response when deleting labeled thing.');
      });
  }
}

LabeledThingGateway.$inject = [
  'ApiService',
  'revisionManager',
  'bufferedHttp',
  'labeledThingData',
  'labeledThingInFrameData',
];

export default LabeledThingGateway;
