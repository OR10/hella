/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class LabeledThingGateway {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {PouchDbViewService} pouchDbViewService
   * @param {LabeledThingGroupGateway} labeledThingGroupGateway
   */
  constructor(
    $q,
    pouchDbContextService,
    packagingExecutor,
    couchDbModelSerializer,
    couchDbModelDeserializer,
    revisionManager,
    pouchDbViewService,
    labeledThingGroupGateway,
  ) {
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

    /**
     * @type {LabeledThingGroupGateway}
     * @private
     */
    this._labeledThingGroupGateway = labeledThingGroupGateway;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {Promise}
   * @private
   */
  _deleteLtifsOutsideOfLtFrameRange(labeledThing) {
    const task = labeledThing.task;
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._$q.resolve()
      .then(() => {
        return this._getAssociatedLabeledThingsInFrames(task, labeledThing);
      })
      .then(documents => {
        return documents.rows.filter(document => {
          return (document.doc.frameIndex < labeledThing.frameRange.startFrameIndex ||
            document.doc.frameIndex > labeledThing.frameRange.endFrameIndex);
        });
      })
      .then(rows => {
        // Mark filtered documents as deleted
        const bulkActionDocuments = rows.map(
          row => ({
            _id: row.doc._id,
            _rev: row.doc._rev,
            _deleted: true,
          })
        );

        // Bulk update as deleted marked documents
        return dbContext.bulkDocs(bulkActionDocuments);
      })
      .then(results => {
        const oneOrMoreBulkOperationsFailed = results.reduce(
          (carry, result) => carry || result.ok !== true,
          false
        );

        if (oneOrMoreBulkOperationsFailed) {
          return this._$q.reject(`Removal of LTIFs failed: ${JSON.stringify(results)}`);
        }

        return true;
      });
  }

  /**
   * @param {LabeledThingGroup} labeledThingGroup
   * @returns {Promise}
   * @private
   */
  _deleteLtgifsOutsideOfLtgFrameRange(labeledThingGroup) {
    return this._$q.resolve()
      .then(
        () => this._labeledThingGroupGateway.getFrameIndexRangeForLabeledThingGroup(labeledThingGroup)
      )
      .then(
        frameIndexRange => this._labeledThingGroupGateway.deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(
          labeledThingGroup,
          frameIndexRange
        )
      );
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {Promise}
   * @private
   */
  _deleteLtgifsOutsideOfLtgsFrameRangesByLabeledThing(labeledThing) {
    const task = labeledThing.task;

    const groupIds = labeledThing.groupIds;

    return this._$q.resolve()
      .then(
        () => this._labeledThingGroupGateway.getLabeledThingGroupsByIds(task, groupIds)
      )
      .then(
        labeledThingGroups => this._$q.all(
          labeledThingGroups.map(
            labeledThingGroup => this._deleteLtgifsOutsideOfLtgFrameRange(labeledThingGroup)
          )
        )
      );
  }

  /**
   * Save a {@link LabeledThing} without using the packaging executor
   *
   * This method is supposed to be only called internally. Its execution should always be executed inside a
   * `labeledThing` based packaging executor queue.
   *
   * The method handles the removal of {@link LabeledThingInFrame} objects, as well as {@link LabeledThingGroupInFrame}
   * objects, which are no longer valid due the `new` frameRange of the given `LabeledThing` as part of the update.
   *
   * The updated {@link LabeledThing} object is returned on success.
   *
   * @param {LabeledThing} labeledThing
   * @returns {LabeledThing}
   * @private
   */
  _saveLabeledThingWithoutPackagingExecutor(labeledThing) {
    const task = labeledThing.task;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    const serializedLabeledThing = this._couchDbModelSerializer.serialize(labeledThing);
    let readLabeledThing = null;

    this._injectRevisionOrFailSilently(serializedLabeledThing);
    return this._$q.resolve()
      .then(() => this._isLabeledThingIncomplete(dbContext, labeledThing))
      .then(isIncomplete => {
        serializedLabeledThing.incomplete = isIncomplete;
        return dbContext.put(serializedLabeledThing);
      })
      .then(dbResponse => {
        return dbContext.get(dbResponse.id);
      })
      .then(readLabeledThingDocument => {
        this._revisionManager.extractRevision(readLabeledThingDocument);
        readLabeledThing = this._couchDbModelDeserializer.deserializeLabeledThing(readLabeledThingDocument, task);
      })
      .then(() => {
        return this._$q.all([
          this._deleteLtifsOutsideOfLtFrameRange(readLabeledThing),
          this._deleteLtgifsOutsideOfLtgsFrameRangesByLabeledThing(labeledThing),
        ]);
      })
      .then(() => {
        return readLabeledThing;
      });
  }

  /**
   * @param {LabeledThing} labeledThing
   * @return {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThing',
      () => this._saveLabeledThingWithoutPackagingExecutor(labeledThing)
    );
  }

  _isLabeledThingIncomplete(dbContext, labeledThing) {
    return dbContext.query(
      this._pouchDbViewService.getDesignDocumentViewName(
        'labeledThingInFrameByLabeledThingIdAndIncomplete'
      ),
      {
        group: true,
        group_level: 1,
        startkey: [labeledThing.id, labeledThing.frameRange.startFrameIndex],
        endkey: [labeledThing.id, labeledThing.frameRange.endFrameIndex],
      }
    ).then(response => {
      if (response.rows.length === 0) {
        // New LabeledThings has no LabeledThingsInFrames.
        return true;
      }

      return (response.rows[0].value > 0);
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

      const ltifPromise = this._getAssociatedLabeledThingsInFrames(task, labeledThing)
        .then(documents => {
          // Mark found documents as deleted
          return documents.rows.map(document => {
            return {
              _id: document.doc._id,
              _rev: document.doc._rev,
              _deleted: true,
            };
          });
        })
        .then(updatedDocs => {
          // Bulk update as deleted marked documents
          return dbContext.bulkDocs(updatedDocs);
        });

      // Return promise of the deletion of lt and associated ltifs
      return this._$q.all([ltPromise, ltifPromise]);
    });

    // @TODO: is the return value (couchdb-document) correct for the implemented interface here?
    return synchronizedPromise;
  }

  /**
   * @param {Task} task
   * @return {AbortablePromise.<{count: int}|Error>}
   */
  getIncompleteLabeledThingCount(task) {
    /**
     * @TODO: To fully work with local pouchdb replicate the incomplete flag needs to be updated during storage
     *        of LabeledThingsInFrame correctly.
     */
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThing',
      () => db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingIncomplete'), {
        include_docs: false,
        key: [task.id, true],
      })
    ).then(response => {
      return {
        count: response.rows.length,
      };
    });
  }

  /**
   * Assign the given list of {@link LabeledThing}s to a {@link LabeledThingGroup}.
   *
   * @param {LabeledThing[]} labeledThings
   * @param {LabeledThingGroup} labeledThingGroup
   */
  assignLabeledThingsToLabeledThingGroup(labeledThings, labeledThingGroup) {
    const modifiedLabeledThings = labeledThings.map(labeledThing => {
      if (labeledThing.groupIds.indexOf(labeledThingGroup.id) === -1) {
        labeledThing.groupIds.push(labeledThingGroup.id);
      }
      return labeledThing;
    });

    return this._packagingExecutor.execute(
      // It is important to put this into the `labeledThing` queue not the `labeledThingGroup` queue!
      'labeledThing',
      () => {
        const promises = [];

        modifiedLabeledThings.forEach(labeledThing => {
          promises.push(this._saveLabeledThingWithoutPackagingExecutor(labeledThing));
        });

        return this._$q.all(promises);
      }
    );
  }

  /**
   * Remove assignment of a {@link LabeledThingGroup} from a list of {@link LabeledThing}s.
   *
   * @param {LabeledThing[]} labeledThings
   * @param {LabeledThingGroup} labeledThingGroup
   */
  unassignLabeledThingsFromLabeledThingGroup(labeledThings, labeledThingGroup) {
    const modifiedLabeledThings = labeledThings.map(labeledThing => {
      const index = labeledThing.groupIds.indexOf(labeledThingGroup.id);
      if (index !== -1) {
        labeledThing.groupIds.splice(index, 1);
      }
      return labeledThing;
    });

    return this._packagingExecutor.execute(
      // It is important to put this into the `labeledThing` queue not the `labeledThingGroup` queue!
      'labeledThing',
      () => {
        const promises = [];

        modifiedLabeledThings.forEach(labeledThing => {
          promises.push(this._saveLabeledThingWithoutPackagingExecutor(labeledThing));
        });

        return this._$q.all(promises);
      }
    );
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @private
   */
  _getAssociatedLabeledThingsInFrames(task, labeledThing) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return dbContext.query(this._pouchDbViewService.getDesignDocumentViewName(
      'labeledThingInFrameByLabeledThingIdAndFrameIndex'), {
      include_docs: true,
      startkey: [labeledThing.id, 0],
      endkey: [labeledThing.id, {}],
    });
  }
}

LabeledThingGateway.$inject = [
  '$q',
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'revisionManager',
  'pouchDbViewService',
  'labeledThingGroupGateway',
];

export default LabeledThingGateway;
