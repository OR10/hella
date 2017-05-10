/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingGateway {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {PouchDbViewService} pouchDbViewService
   */
  constructor(
    $q,
    pouchDbContextService,
    packagingExecutor,
    couchDbModelSerializer,
    couchDbModelDeserializer,
    revisionManager,
    pouchDbViewService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

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
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing, incomplete = true) {
    labeledThing.incomplete = incomplete;

    const task = labeledThing.task;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    const serializedLabeledThing = this._couchDbModelSerializer.serialize(labeledThing);
    let readLabeledThing = null;

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThing', () => {
      this._injectRevisionOrFailSilently(serializedLabeledThing);
      return dbContext.put(serializedLabeledThing)
        .then(dbResponse => {
          return dbContext.get(dbResponse.id);
        })
        .then(readLabeledThingDocument => {
          this._revisionManager.extractRevision(readLabeledThingDocument);
          readLabeledThing = this._couchDbModelDeserializer.deserializeLabeledThing(readLabeledThingDocument, task);
        })
        .then(() => {
          return this._getAssociatedLabeledThingsInFrames(task, readLabeledThing);
        })
        .then(documents => {
          return documents.rows.filter(document => {
            return (document.doc.frameIndex < labeledThing.frameRange.startFrameIndex ||
            document.doc.frameIndex > labeledThing.frameRange.endFrameIndex);
          });
        })
        .then(toBeDeletedDocuments => {
          // Mark filtered documents as deleted
          const docs = toBeDeletedDocuments.map(document => {
            const doc = document.doc;
            doc._deleted = true;
            return doc;
          });

          // Bulk update as deleted marked documents
          return dbContext.bulkDocs(docs);
        })
        .then(() => {
          return readLabeledThing;
        });
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
    const labeledThingDocument = this._couchDbModelSerializer.serialize(labeledThing);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    const synchronizedPromise = this._packagingExecutor.execute('labeledThing', () => {
      this._injectRevisionOrFailSilently(labeledThingDocument);

      const ltPromise = dbContext.remove(labeledThingDocument);

      const ltifPromise = this._getAssociatedLabeledThingsInFrames(task, labeledThing).then(documents => {
        // Mark found documents as deleted
        const docs = documents.rows.map(document => {
          const doc = document.doc;
          doc._deleted = true;
          return doc;
        });

        // Bulk update as deleted marked documents
        return dbContext.bulkDocs(docs);
      });

      // Return promise of the deletion of lt and associated ltifs
      return this._$q.all(ltPromise, ltifPromise);
    });

    // @TODO: is the return value (couchdb-document) correct for the implemented interface here?
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
      () => db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingIncomplete'), {
        include_docs: false,
        key: [taskId, true],
      })
    ).then(response => {
      return {
        count: response.rows.length,
      };
    });
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @private
   */
  _getAssociatedLabeledThingsInFrames(task, labeledThing) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return dbContext.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByLabeledThingIdAndFrameIndex'), {
      include_docs: true,
      startkey: [labeledThing.id, 0],
      endkey: [labeledThing.id, {}],
    });
  }
}

PouchDbLabeledThingGateway.$inject = [
  '$q',
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'revisionManager',
  'pouchDbViewService',
];

export default PouchDbLabeledThingGateway;
