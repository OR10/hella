import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingGateway {
  /**
   * @param {StorageContextService} storageContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {RevisionManager} revisionManager
   */
  constructor(storageContextService, packagingExecutor, couchDbModelSerializer, revisionManager) {
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

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const db = this._storageContextService.provideContextForTaskId(labeledThing.task.id);
    const document = this._couchDbModelSerializer.serialize(labeledThing);
    this._injectRevisionOrFailSilently(document);
    //@TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThing',
      () => db.put(document)
    ).then(response => {
      this._revisionManager.extractRevision(response);
      return new LabeledThing(Object.assign({}, labeledThing.toJSON(), {task: labeledThing.task}));
    });


    return this._bufferedHttp.put(url, labeledThing, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
        }

        throw new Error('Received malformed response when creating labeled thing.');
      });
  }

  /**
   * Inject a revision into the document or fail silently and ignore the error.
   *
   * @param {object} document
   * @private
   */
  _injectRevisionOrFailSilently(document) {
    try {
      this._revisionManager.injectRevision(document);
    } catch (error) {
      // Simply ignore
    }
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
  'revisionManager',
];

export default PouchDbLabeledThingGateway;
