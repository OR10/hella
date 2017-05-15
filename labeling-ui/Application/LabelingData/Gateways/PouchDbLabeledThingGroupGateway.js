/**
 * Gateway for CRUD operation on {@link LabeledThingGroup}s in a PouchDb
 */
class PouchDbLabeledThingGroupGateway {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   * @param {PouchDbLabeledThingGateway} labeledThingGateway
   * @param {EntityIdService} entityIdService
   * @param {PouchDbViewService} pouchDbViewService
   */
  constructor($q,
              pouchDbContextService,
              packagingExecutor,
              couchDbModelSerializer,
              couchDbModelDeserializer,
              revisionManager,
              abortablePromiseFactory,
              labeledThingGateway,
              entityIdService,
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
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;

    /**
     * @type {PouchDbLabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    this._pouchDbViewService = pouchDbViewService;
  }

  /**
   * Requests labeled thing groups for the given task and frame index.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @return {AbortablePromise}
   */
  getLabeledThingGroupsInFrameForFrameIndex(task, frameIndex) {
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return dbContext.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingGroupInFrameByTaskIdAndFrameIndex'), {
        key: [taskId, frameIndex],
      })
        .then(response => response.rows.map(row => row.value))
        .then(labeledThingGroupIds => {
          // Filter duplicate labeledThingGroupIds
          const filteredLabeledThingGroupIds = labeledThingGroupIds.filter((value, index, array) => array.indexOf(value) === index);
          const promises = [];

          filteredLabeledThingGroupIds.forEach(labeledThingGroupId => {
            promises.push(dbContext.get(labeledThingGroupId));
          });

          // TODO: Not sure if it is ok to pass filtered ids!? Needs to be checked!
          return this._$q.all([this._$q.resolve(labeledThingGroupIds), this._$q.all(promises)]);
        })
        .then(([labeledThingGroupIds, labeledThingGroupDocuments]) => {
          const labeledThingGroups = labeledThingGroupDocuments.map(labeledThingGroupDocument => {
            this._revisionManager.extractRevision(labeledThingGroupDocument);
            return this._couchDbModelDeserializer.deserializeLabeledThingGroup(labeledThingGroupDocument, task);
          });

          const labeledThingGroupsInFrame = labeledThingGroupIds.map(labeledThingGroupId => {
            const assignedLabeledThingGroup = labeledThingGroups.find(labeledThingGroup => labeledThingGroup.id === labeledThingGroupId);

            const dbDocument = {
              id: this._entityIdService.getUniqueId(),
              classes: [],
              labeledThingGroup: assignedLabeledThingGroup,
              frameIndex,
              labeledThingGroupId,
            };
            // TODO: If the labeledThingGroupInFrame documents are no longer generated, we need to extract revision here
            return this._couchDbModelDeserializer.deserializeLabeledThingGroupInFrame(dbDocument);
          });

          return labeledThingGroupsInFrame;
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

      return dbContext.remove(labeledThingGroupDocument)
        .then(result => result.ok === true)
        .catch(() => {
          throw new Error('Received malformed response when deleting labeled thing group.');
        });
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
      })
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
          promises.push(this._labeledThingGateway.saveLabeledThing(labeledThing, labeledThing.incomplete));
        });

        return this._abortablePromiseFactory(this._$q.all(promises));
      });
  }

  /**
   * Remove group assignment from the labeled thing
   *
   * @param {Array.<LabeledThing>} labeledThings
   * @param {LabeledThingGroup} labeledThingGroup
   */
  unassignLabeledThingsToLabeledThingGroup(labeledThings, labeledThingGroup) {
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

PouchDbLabeledThingGroupGateway.$inject = [
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
];

export default PouchDbLabeledThingGroupGateway;
