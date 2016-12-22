/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   */
  constructor(pouchDbContextService, packagingExecutor, couchDbModelSerializer, couchDbModelDeserializer, revisionManager, pouchDbSyncManager) {
    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

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
     * @type {PouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const task = labeledThing.task;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    const serializedLabeledThing = this._couchDbModelSerializer.serialize(labeledThing);
    let storedLabeledThingId;

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThing', () => {
      this._injectRevisionOrFailSilently(serializedLabeledThing);
      return dbContext.put(serializedLabeledThing);
    })
    .then(dbResponse => {
      storedLabeledThingId = dbResponse.id;
      return this._pouchDbSyncManager.waitForRemoteToConfirm(dbContext);
    })
    .then(() => {
      return dbContext.get(storedLabeledThingId);
    })
    .then(readLabeledThing => {
      this._revisionManager.extractRevision(readLabeledThing);
      return this._couchDbModelDeserializer.deserializeLabeledThing(readLabeledThing, task);
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
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  getLabeledThing(task, labeledThingId) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    const synchronizedDbPromize = this._packagingExecutor.execute('labeledThing', () => {
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
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    const document = this._couchDbModelSerializer.serialize(labeledThing);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    const synchronizedPromise = this._packagingExecutor.execute('labeledThing', () => {
      this._injectRevisionOrFailSilently(document);
      return dbContext.remove(document);
      // TODO: delete labeledThingsInFrame
    })
    .then(dbDocument => this._pouchDbSyncManager.waitForRemoteToConfirm(dbContext, dbDocument));

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
    const db = this._pouchDbContextService.provideContextForTaskId(taskId);
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
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'revisionManager',
  'pouchDbSyncManager',
];

export default PouchDbLabeledThingGateway;
