import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingGateway {
  /**
   * @param {StorageContextService} storageContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   */
  constructor(storageContextService, packagingExecutor, couchDbModelSerializer, couchDbModelDeserializer, revisionManager, storageSyncManager) {
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
     * @type {CouchDbModelDeserializer}
     * @private
     */
    this._couchDbModelDeserializer = couchDbModelDeserializer;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {StorageSyncManager}
     * @private
     */
    this._storageSyncManager = storageSyncManager;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const task = labeledThing.task;
    const dbContext = this._storageContextService.provideContextForTaskId(task.id);
    const document = this._couchDbModelSerializer.serialize(labeledThing);
    let dbResponse;

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    const synchronizedDbPromise = this._packagingExecutor.execute('labeledThing', () => {
      this._injectRevisionOrFailSilently(document);
      return dbContext.put(document);
    })
    .then(dbDocument => this._storageSyncManager.waitForRemoteToConfirm(dbContext, dbDocument))
    .then(dbDocument => {
      this._revisionManager.extractRevision(response);
      return this._couchDbModelDeserializer.deserializeLabeledThing(dbDocument, task);
    });
    return synchronizedDbPromise;
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
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  getLabeledThing(task, labeledThingId) {
    const dbContext = this._storageContextService.provideContextForTaskId(task.id);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    let synchronizedDbPromize = this._packagingExecutor.execute('labeledThing', () => {
      return dbContext.get(labeledThingId);
    })
    .then(dbDocument => {
      this._revisionManager.extractRevision(dbDocument);
      return this._couchDbModelDeserializer.deserializeLabeledThing(dbDocument, task);
    });
    return synchronizedDbPromize;
  }

  /**
   * Delete a {@link LabeledThing} and all its descending {@link LabeledThingInFrame} objects
   *
   * @param {LabeledThing} labeledThing
   * @return {AbortablePromise}
   */
  deleteLabeledThing(labeledThing) {
    const task = labeledThing.task;
    const dbContext = this._storageContextService.provideContextForTaskId(task.id);
    const document = this._couchDbModelSerializer.serialize(labeledThing);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    let synchronizedPromise = this._packagingExecutor.execute('labeledThing', () => {
        this._injectRevisionOrFailSilently(document);
        return dbContext.remove(document);
    })
    .then(dbDocument => this._storageSyncManager.waitForRemoteToConfirm(dbContext, dbDocument))
    .then(response => {
      this._revisionManager.extractRevision(response);
      return true;
    });

    return synchronizedPromise;
  }

  /**
   * @param {string} taskId
   * @return {AbortablePromise.<{count: int}|Error>}
   */
  getIncompleteLabeledThingCount(taskId) {
    /**
     * @TODO: To fully work with local pouchdb replicate the incomplete flag needs to be updated during storage
     *        of LabeledThingsInFrame correctly.
     */
    const db = this._storageContextService.provideContextForTaskId(taskId);
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThing',
      () => db.query('annostation_labeled_thing/incomplete', {
        include_docs: false,
        key: [taskId, true],
      })
    ).then(response => {
      return {
        count: response.rows.length,
      };
    });
  }
}

PouchDbLabeledThingGateway.$inject = [
  'storageContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'revisionManager',
];

export default PouchDbLabeledThingGateway;