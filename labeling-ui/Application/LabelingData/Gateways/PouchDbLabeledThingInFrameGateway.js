/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingInFrameGateway {
  /**
   * @param {$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {RevisionManager} revisionManager
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {GhostingService} ghostingService
   * @param {PouchDbViewService} pouchDbViewService
   * @param {LabelStructureService} labelStructureService
   */
  constructor($q,
              pouchDbContextService,
              revisionManager,
              packagingExecutor,
              couchDbModelSerializer,
              couchDbModelDeserializer,
              labeledThingGateway,
              ghostingService,
              pouchDbViewService,
              labelStructureService) {
    /**
     * @type {$q}
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
     * @type {PouchDbLabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {GhostingService}
     * @private
     */
    this._ghostingService = ghostingService;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameIndex`
   *
   * @param {Task} task
   * @param {Number} frameIndex
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameIndex, offset = 0, limit = 1) {
    const startkey = [task.id, frameIndex + offset];
    const endkey = [task.id, frameIndex + offset + limit - 1];
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute('labeledThingInFrame', () => {
      return db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByTaskIdAndFrameIndex'), {
        startkey,
        endkey,
        include_docs: true,
      });
    })
      .then(result => {
        const rows = result.rows.filter(row => row.doc !== undefined);
        const promises = rows.map(row => {
          const labeledThingInFrame = row.doc;
          this._revisionManager.extractRevision(labeledThingInFrame);

          return this._labeledThingGateway.getLabeledThing(task, labeledThingInFrame.labeledThingId)
            .then(labeledThing => {
              return this._couchDbModelDeserializer.deserializeLabeledThingInFrame(labeledThingInFrame, labeledThing);
            });
        });

        return this._$q.all(promises);
      })
      .then(labeledThingsInFrame => this._ghostingService.calculateClassGhostsForLabeledThingsInFrames(labeledThingsInFrame));
  }


  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameIndex`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameIndex`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameIndex, labeledThing, offset = 0, limit = 1) {
    const startkey = [labeledThing.id, labeledThing.frameRange.startFrameIndex];
    const endkey = [labeledThing.id, labeledThing.frameRange.endFrameIndex];

    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute('labeledThingInFrame', () => {
      return db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByLabeledThingIdAndFrameIndex'), {
        startkey,
        endkey,
        include_docs: true,
      })
        .then(result => {
          if (result.rows) {
            const allLabeledThingsInFrameOfLabeledThing = [];
            result.rows.forEach(row => {
              if (row.doc) {
                const labeledThingInFrame = row.doc;
                this._revisionManager.extractRevision(labeledThingInFrame);
                allLabeledThingsInFrameOfLabeledThing.push(this._couchDbModelDeserializer.deserializeLabeledThingInFrame(labeledThingInFrame, labeledThing));
              } else {
                throw new Error('Row does not contain a document');
              }
            });

            if (allLabeledThingsInFrameOfLabeledThing.length <= 0) {
              return [];
            }

            return this._ghostingService.calculateShapeGhostsForLabeledThingInFrames(frameIndex, offset, limit, labeledThing.frameRange, allLabeledThingsInFrameOfLabeledThing);
          }

          throw new Error(`Failed loading labeled thing in frame for the given labeledThing: ${labeledThing.id}`);
        })
        .then(labeledThingsInFrameWithShapeGhosts => this._ghostingService.calculateClassGhostsForLabeledThingsInFrames(labeledThingsInFrameWithShapeGhosts));
    });
  }

  /**
   * Returns the next incomplete labeled things in frame.
   * The count can be specified, the default is one.
   *
   * @param {Task} task
   * @param {int?} count
   *
   * @returns {AbortablePromise<Array.<LabeledThingInFrame>>|Error}
   */
  getNextIncomplete(task, count = 1) { // eslint-disable-line no-unused-vars
    const startkey = [task.id, true];
    const endkey = [task.id, true];

    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThingInFrame', () => {
      return db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameIncomplete'), {
        startkey,
        endkey,
        limit: count,
      });
    }).then(incompleteDocumentResult => {
      const promises = [];
      incompleteDocumentResult.rows.forEach(incompleteDocument => {
        promises.push(db.get(incompleteDocument.id));
      });
      return this._$q.all(promises);
    }).then(labeledThingInFrameDocuments => {
      const promises = [];

      labeledThingInFrameDocuments.forEach(doc => {
        promises.push(db.get(doc.labeledThingId));
      });

      return this._$q.all([this._$q.resolve(labeledThingInFrameDocuments), this._$q.all(promises)]);
    }).then(([labeledThingInFrameDocuments, labeledThingResponse]) => {
      const labeledThings = labeledThingResponse.map(labeledThingDocument => {
        return this._couchDbModelDeserializer.deserializeLabeledThing(labeledThingDocument, task);
      });

      return labeledThingInFrameDocuments.map(ltifDocument => {
        return this._couchDbModelDeserializer.deserializeLabeledThingInFrame(ltifDocument, labeledThings.find(lt => lt.id === ltifDocument.labeledThingId));
      });
    });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {string} taskId
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame, taskId = null) {
    let storedLabeledThingInFrame;
    let storedLabeledThing;

    taskId = taskId ? taskId : labeledThingInFrame.labeledThing.task.id; // eslint-disable-line no-param-reassign

    if (labeledThingInFrame.ghost === true) {
      throw new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!');
    }

    return labeledThingInFrame.updateIncompleteStatus(this._labelStructureService).then(() => {
      const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);
      const serializedLabeledThingInFrame = this._couchDbModelSerializer.serialize(labeledThingInFrame);

      // @TODO: What about error handling here? No global handling is possible this easily?
      //       Monkey-patch pouchdb? Fix error handling at usage point?
      return this._packagingExecutor.execute(
        'labeledThing',
        () => {
          this._injectRevisionOrFailSilently(serializedLabeledThingInFrame);
          return dbContext.put(serializedLabeledThingInFrame)
            .then(response => {
              return dbContext.get(response.id);
            })
            .then(readDocument => {
              this._revisionManager.extractRevision(readDocument);

              return this._couchDbModelDeserializer.deserializeLabeledThingInFrame(readDocument, labeledThingInFrame._labeledThing);
            })
            .then(deserializedLabeledThingInFrame => {
              storedLabeledThingInFrame = deserializedLabeledThingInFrame;
              storedLabeledThing = deserializedLabeledThingInFrame.labeledThing;

              return dbContext.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByLabeledThingIdAndIncomplete'), {
                reduce: true,
                keys: [storedLabeledThing.id],
              });
            })
            .then(response => {
              const isLabeledThingIncomplete = (response.rows[0].value > 0);
              const serializedLabeledThing = this._couchDbModelSerializer.serialize(storedLabeledThing);
              serializedLabeledThing.incomplete = isLabeledThingIncomplete;

              this._injectRevisionOrFailSilently(serializedLabeledThing);

              return dbContext.put(serializedLabeledThing)
                .then(dbResponse => dbContext.get(dbResponse.id))
                .then(readLabeledThingDocument => this._revisionManager.extractRevision(readLabeledThingDocument));
            })
            .then(() => {
              return storedLabeledThingInFrame;
            });
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

}

PouchDbLabeledThingInFrameGateway.$inject = [
  '$q',
  'pouchDbContextService',
  'revisionManager',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'labeledThingGateway',
  'ghostingService',
  'pouchDbViewService',
  'labelStructureService',
];

export default PouchDbLabeledThingInFrameGateway;
