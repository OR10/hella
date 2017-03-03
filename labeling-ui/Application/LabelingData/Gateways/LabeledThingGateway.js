import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s
 */
class LabeledThingGateway {
  /**
   * @param {ApiService} apiService
   * @param {RevisionManager} revisionManager
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, revisionManager, bufferedHttp) {
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
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const url = this._apiService.getApiUrl(`/task/${labeledThing.task.id}/labeledThing/${labeledThing.id}`);

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
        if (response.data && response.data.result && response.data.result.success === true) {
          return true;
        }

        throw new Error('Received malformed response when deleting labeled thing.');
      });
  }

  /**
   * @param {string} taskId
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  getIncompleteLabeledThingCount(taskId) {
    const url = this._apiService.getApiUrl(`/task/${taskId}/labeledThingsIncompleteCount`);

    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Received malformed response when requesting incomplete labeled thing count.');
      });
  }
}

LabeledThingGateway.$inject = [
  'ApiService',
  'revisionManager',
  'bufferedHttp',
];

export default LabeledThingGateway;
