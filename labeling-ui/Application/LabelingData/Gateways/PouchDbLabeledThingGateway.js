import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingGateway {
  /**
   * @param {StorageContextService} storageContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   */
  constructor(storageContextService, packagingExecutor, couchDbModelSerializer) {
    /**
     * @type {StorageContextService}
     * @private
     */
    this._storageContextService = storageContextService;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {PackagingExecutor}
     * @private
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {CouchDbModelSerializer}
     * @private
     */
    this._couchDbModelSerializer = couchDbModelSerializer;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const document = this._couchDbModelSerializer.serialize(labeledThing);

    // Store using PackagingExecutor
    // Return result LabeledThingModel (using CouchDbModelDeserializer?)
    // extract revision (in deserializer?)
    // Wo fangen wir 409er ab? können wir das damit überhaupt noch? Sollten wir bei der gelegenheit alle stellen
    // überarbeiten und "sinnvolles" errorhandling einbauen? Eventuell zunächst ignorieren und in Schritt 2 erledigen?

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
        if (response.data && response.data.success === true) {
          return true;
        }

        throw new Error('Received malformed response when deleting labeled thing.');
      });
  }

  /**
   * @param {Task} task
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  getIncompleteLabelThingCount(taskId) {
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

PouchDbLabeledThingGateway.$inject = [
  'storageContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
];

export default PouchDbLabeledThingGateway;
