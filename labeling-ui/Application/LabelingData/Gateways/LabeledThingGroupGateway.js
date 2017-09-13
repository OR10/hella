import {uniq} from 'lodash';

/**
 * Gateway for CRUD operation on {@link LabeledThingGroup}s in a PouchDb
 */
class LabeledThingGroupGateway {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {EntityIdService} entityIdService
   * @param {PouchDbViewService} pouchDbViewService
   * @param {GhostingService} ghostingService
   */
  constructor(
    $q,
    pouchDbContextService,
    packagingExecutor,
    couchDbModelSerializer,
    couchDbModelDeserializer,
    revisionManager,
    abortablePromiseFactory,
    labeledThingGateway,
    entityIdService,
    pouchDbViewService,
    ghostingService
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
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

    /**
     * @type {GhostingService}
     * @private
     */
    this._ghostingService = ghostingService;
  }

  /**
   * Get the ids of LabeledThingGroups, which are present on a certain frameIndex of the given task
   *
   * @param {number} frameIndex
   * @param {Task} task
   * @return {Promise.<string[]>}
   * @private
   */
  _getLabeledThingGroupIdsOnFrameForTask(frameIndex, task) {
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return dbContext.query(
      this._pouchDbViewService.getDesignDocumentViewName(
        'labeledThingGroupOnFrameByTaskIdAndFrameIndex'
      ),
      {
        key: [taskId, frameIndex],
      }
    )
      .then(response => response.rows.map(row => row.value))
      .then(ids => uniq(ids));
  }

  /**
   * Retrieve all LabeledThingGroups which are present on a certain frameIndex for the given task
   *
   * @param {number} frameIndex
   * @param {Task} task
   * @return {Promise.<LabeledThingGroup[]>}
   * @private
   */
  _getLabeledThingGroupsOnFrameForTask(frameIndex, task) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._getLabeledThingGroupIdsOnFrameForTask(frameIndex, task)
      .then(labeledThingGroupIds => {
        const promises = [];

        labeledThingGroupIds.forEach(labeledThingGroupId => {
          promises.push(dbContext.get(labeledThingGroupId));
        });

        return this._$q.all(promises);
      })
      .then(labeledThingGroupDocuments => {
        labeledThingGroupDocuments.forEach(
          labeledThingGroupDocument => this._revisionManager.extractRevision(labeledThingGroupDocument)
        );

        return labeledThingGroupDocuments.map(
          labeledThingGroupDocument => this._couchDbModelDeserializer.deserializeLabeledThingGroup(
            labeledThingGroupDocument,
            task
          )
        );
      });
  }

  /**
   * Requests labeled thing groups for the given task and frame index.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @return {AbortablePromise}
   */
  getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex) {
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return this._getLabeledThingGroupsOnFrameForTask(frameIndex, task)
        .then(
          labeledThingGroups => this._ghostingService.calculateClassGhostsForLabeledThingGroupsAndFrameIndex(
            labeledThingGroups,
            frameIndex
          )
        );
    });
  }

  /**
   * @param {Task} task
   * @param {string[]} ids
   * @returns {Promise.<LabeledThingGroup[]>}
   */
  getLabeledThingGroupsByIds(task, ids) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return dbContext.allDocs({
        include_docs: true,
        keys: ids,
      })
        .then(result => {
          const rows = result.rows;
          const erronousDocuments = rows.filter(
            row => row.error !== undefined || row.deleted === true
          );

          if (erronousDocuments.length > 0) {
            const errorJson = JSON.stringify(erronousDocuments, undefined, 2);
            return this._$q.reject(new Error(`One or more of the requested groups could not be retrieved: ${errorJson}`));
          }

          const documents = rows.map(row => row.doc);
          return documents.map(document => this._couchDbModelDeserializer.deserializeLabeledThingGroup(document, task));
        });
    });
  }

  /**
   * Deletes a labeled thing group with the given id.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {AbortablePromise}
   */
  deleteLabeledThingGroup(labeledThingGroup) {
    const task = labeledThingGroup.task;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);
    const labeledThingGroupDocument = this._couchDbModelSerializer.serialize(labeledThingGroup);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThingGroup', () => {
      this._injectRevisionOrFailSilently(labeledThingGroupDocument);

      return this._$q.resolve()
        .then(() => this._getAssociatedLTGIFsForLTG(labeledThingGroup))
        .then(ltgifs => {
          if (ltgifs.length === 0) {
            return [];
          }

          const bulkDocumentActions = ltgifs.map(
            ltgif => ({
              _id: ltgif.id,
              _rev: this._revisionManager.getRevision(ltgif.id),
              _deleted: true,
            })
          );

          return dbContext.bulkDocs(bulkDocumentActions);
        })
        .then(results => {
          const oneOrMoreBulkOperationsFailed = results.reduce(
            (carry, result) => carry || result.ok !== true,
            false
          );

          if (oneOrMoreBulkOperationsFailed) {
            return this._$q.reject(`Removal of LTGIFs failed: ${JSON.stringify(results)}`);
          }
        })
        .then(() => dbContext.remove(labeledThingGroupDocument))
        .then(result => {
          if (result.ok !== true) {
            return this._$q.reject(`Error deleting ${labeledThingGroupDocument._id}: ${result.error}`);
          }

          return true;
        });
    });
  }

  /**
   * Retrieve all {@link LabeledThingGroupInFrame} objects associated with a certain
   * {@link LabeledThingGroup}
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @returns {Promise.<LabeledThingGroupInFrame[]>}
   * @private
   */
  _getAssociatedLTGIFsForLTG(labeledThingGroup) {
    const task = labeledThingGroup.task;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._$q.resolve()
      .then(
        () => dbContext.query(
          this._pouchDbViewService.getDesignDocumentViewName(
            'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex'),
          {
            include_docs: true,
            startkey: [labeledThingGroup.id, 0],
            endkey: [labeledThingGroup.id, {}],
          }
        )
      )
      .then(result => {
        if (result.rows.length === 0) {
          return [];
        }

        return result.rows.map(
          row => this._couchDbModelDeserializer.deserializeLabeledThingGroupInFrame(
            row.doc,
            labeledThingGroup
          )
        );
      });
  }

  /**
   * Create a labeled thing group of the given type.
   *
   * @param {Task} task
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {AbortablePromise}
   */
  createLabeledThingGroup(task, labeledThingGroup) {
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);
    const serializedLabeledThingGroup = this._couchDbModelSerializer.serialize(labeledThingGroup);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThingGroup',
      () => {
        this._injectRevisionOrFailSilently(serializedLabeledThingGroup);
        return dbContext.put(serializedLabeledThingGroup);
      }
    )
      .then(response => {
        return dbContext.get(response.id);
      })
      .then(readDocument => {
        this._revisionManager.extractRevision(readDocument);
        return this._couchDbModelDeserializer.deserializeLabeledThingGroup(readDocument, task);
      });
  }

  /**
   * Assign the given labeled thing to the given group.
   *
   * @param {Array.<LabeledThing>} labeledThings
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
      'labeledThingGroup',
      () => {
        const promises = [];

        modifiedLabeledThings.forEach(labeledThing => {
          promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing));
        });

        return this._abortablePromiseFactory(this._$q.all(promises));
      }
    );
  }

  /**
   * Remove group assignment from the labeled thing
   *
   * @param {Array.<LabeledThing>} labeledThings
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
      'labeledThingGroup',
      () => {
        const promises = [];

        modifiedLabeledThings.forEach(labeledThing => {
          promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing));
        });

        return this._abortablePromiseFactory(this._$q.all(promises));
      }
    );
  }

  /**
   * @param {LabeledThingGroupInFrame} ltgif
   */
  saveLabeledThingGroupInFrame(ltgif) {
    const ltg = ltgif.labeledThingGroup;
    const task = ltg.task;
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);
    const serializedLtgif = this._couchDbModelSerializer.serialize(ltgif);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThingGroup',
      () => {
        this._injectRevisionOrFailSilently(serializedLtgif);
        return dbContext.put(serializedLtgif)
          .then(response => dbContext.get(response.id))
          .then(readDocument => {
            this._revisionManager.extractRevision(readDocument);
            return this._couchDbModelDeserializer.deserializeLabeledThingGroupInFrame(readDocument, ltg);
          });
      }
    );
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

LabeledThingGroupGateway.$inject = [
  '$q',
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'revisionManager',
  'abortablePromiseFactory',
  'labeledThingGateway',
  'entityIdService',
  'pouchDbViewService',
  'ghostingService',
];

export default LabeledThingGroupGateway;
