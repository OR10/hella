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
   * @param {EntityIdService} entityIdService
   * @param {PouchDbViewService} pouchDbViewService
   * @param {GhostingService} ghostingService
   * @param {CurrentUserService} currentUserService
   * @param {LabelStructureService} labelStructureService
   */
  constructor(
    $q,
    pouchDbContextService,
    packagingExecutor,
    couchDbModelSerializer,
    couchDbModelDeserializer,
    revisionManager,
    abortablePromiseFactory,
    entityIdService,
    pouchDbViewService,
    ghostingService,
    currentUserService,
    labelStructureService
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

    /**
     * @type {CurrentUserService}
     * @private
     */
    this._currentUserService = currentUserService;

    /**
     * @type {LabelStructureService}
     * @private
     */
    this._labelStructureService = labelStructureService;
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
   * Determine the frameRange for a specific {@link LabeledThingGroup}
   *
   * The `frameIndexRange` is calculated by looking at all associated {@link LabeledThing} frameRanges and determining
   * the maximum span of overlapping frames.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @returns {Promise.<{startFrameIndex: number, endFrameIndex: number}>}
   */
  getFrameIndexRangeForLabeledThingGroup(labeledThingGroup) {
    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return this._getFrameIndexRangeForLabeledThingGroupWithoutPackagingExecutor(labeledThingGroup);
    });
  }

  /**
   * Determine the frameRange for a specific {@link LabeledThingGroup}
   *
   * The `frameIndexRange` is calculated by looking at all associated {@link LabeledThing} frameRanges and determining
   * the maximum span of overlapping frames.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @returns {Promise.<{startFrameIndex: number, endFrameIndex: number}>}
   */
  _getFrameIndexRangeForLabeledThingGroupWithoutPackagingExecutor(labeledThingGroup) {
    const task = labeledThingGroup.task;
    const taskId = task.id;
    const groupId = labeledThingGroup.id;

    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._$q.resolve()
      .then(
        () => dbContext.query(
          this._pouchDbViewService.getDesignDocumentViewName('labeledThingGroupFrameRange'),
          {
            include_docs: false,
            key: [groupId],
            group: true,
            group_level: 1,
          }
        )
      )
      .then(result => {
        if (result.rows.length === 0) {
          return this._$q.reject(
            `The group ${groupId} does not have a frameRange, as it is not associated with any LabeledThing.`
          );
        }

        const row = result.rows[0];

        return {
          startFrameIndex: row.value[0],
          endFrameIndex: row.value[1],
        };
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
   * Delete a bunch of {@link LabeledThingGroupInFrame} entities
   *
   * If one or more documents could not be deleted the promise is rejected
   *
   * The operation is NOT atomic or transactional.
   *
   * @param {Task} task
   * @param {LabeledThingGroupInFrame[]} ltgifs
   * @returns {Promise.<Array>}
   * @private
   */
  _deleteLabeledThingGroupInFrames(task, ltgifs) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    if (ltgifs.length === 0) {
      return [];
    }

    return this._$q.resolve()
      .then(() => {
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

        return true;
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
        .then(ltgifs => this._deleteLabeledThingGroupInFrames(task, ltgifs))
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
   * Remove all ltgifs of a given ltg, which are outside of the given frameIndexRange
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @param {{startFrameIndex: number, endFrameIndex: number}} frameIndexRange
   * @return {Promise}
   */
  deleteLabeledThingGroupsInFrameOutsideOfFrameIndexRange(labeledThingGroup, frameIndexRange) {
    const task = labeledThingGroup.task;

    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return this._$q.resolve()
        .then(
          () => this._getAssociatedLTGIFsForLTG(labeledThingGroup)
        )
        .then(ltgifs => {
          const ltgifsNotInFrameRange = ltgifs.filter(
            ltgif => ltgif.frameIndex < frameIndexRange.startFrameIndex || ltgif.frameIndex > frameIndexRange.endFrameIndex
          );

          if (ltgifsNotInFrameRange.length === 0) {
            // We do not have anything to delete
            return true;
          }

          return this._deleteLabeledThingGroupInFrames(task, ltgifsNotInFrameRange);
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
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThingGroup',
      () => this._saveLabeledThingGroupWithoutPackagingExecutor(task, labeledThingGroup)
    );
  }

  /**
   * Create a labeled thing group of the given type.
   *
   * @param {Task} task
   * @param {LabeledThingGroup} labeledThingGroup
   * @return {AbortablePromise}
   */
  _saveLabeledThingGroupWithoutPackagingExecutor(task, labeledThingGroup) {
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._$q.resolve()
      .then(() => this._calculateThingGroupIncompleteness(labeledThingGroup))
      .then(incomplete => {
        labeledThingGroup.incomplete = incomplete;

        const serializedLabeledThingGroup = this._couchDbModelSerializer.serialize(labeledThingGroup);
        this._injectRevisionOrFailSilently(serializedLabeledThingGroup);
        serializedLabeledThingGroup.lastModifiedByUserId = this._currentUserService.get().id;

        return dbContext.put(serializedLabeledThingGroup);
      })
      .then(response => {
        return dbContext.get(response.id);
      })
      .then(readDocument => {
        this._revisionManager.extractRevision(readDocument);
        return this._couchDbModelDeserializer.deserializeLabeledThingGroup(readDocument, task);
      })
      .then(document => {
        return document;
      });
  }

  /**
   * Calculates the incompleteness of the complete LabeledThingGroup with all LabeledThingGroupInFrames (if any)
   * @param labeledThingGroup
   * @private
   */
  _calculateThingGroupIncompleteness(labeledThingGroup) {
    const task = labeledThingGroup.task;
    const thingIdentifier = labeledThingGroup.type;

    let ltgFrameRange;
    let ltgFrames;

    return this._getFrameIndexRangeForLabeledThingGroupWithoutPackagingExecutor(labeledThingGroup)
      .then(frameRange => {
        ltgFrames = (frameRange.endFrameIndex - frameRange.startFrameIndex) + 1;
        ltgFrameRange = frameRange;
      })
      .catch(() => {
        ltgFrames = 1;
      })
      .then(() => this._labelStructureService.getLabelStructure(task))
      .then(labelStructure => {
        const labelStructureObject = labelStructure.getGroupById(thingIdentifier);

        const list = labelStructure.getEnabledClassesForLabeledObjectAndClassList(
          labelStructureObject,
          labeledThingGroup.extractClassList()
        );


        let returnValue;
        if (list.length === 0) {
          returnValue = false;
        } else {
          returnValue = this._getAssociatedLTGIFsForLTG(labeledThingGroup)
            .then(labeledThingGroupInFrames => {
              let anyLtgifIncomplete = false;

              const ltgifOnFirstFrameOfGroup = labeledThingGroupInFrames.find(ltgif => ltgif.frameIndex === ltgFrameRange.startFrameIndex);
              const noLtgifOnFirstFrameOfGroup = ltgifOnFirstFrameOfGroup === undefined || ltgifOnFirstFrameOfGroup.incomplete;

              // if there are less ltgif than frames the group is on, and there is no ltgif on the first frame of the
              // group, the whole group is incomplete
              if (labeledThingGroupInFrames.length < ltgFrames && noLtgifOnFirstFrameOfGroup) {
                anyLtgifIncomplete = true;
              } else {
                labeledThingGroupInFrames.forEach(ltg => {
                  if (anyLtgifIncomplete || ltg.incomplete) {
                    anyLtgifIncomplete = true;
                  }
                });
              }

              return anyLtgifIncomplete;
            });
        }

        return returnValue;
      });
  }

  /**
   * @param {Task} task
   * @return {AbortablePromise.<{count: int}|Error>}
   */
  getIncompleteLabeledThingGroupCount(task) {
    /**
     * @TODO: To fully work with local pouchdb replicate the incomplete flag needs to be updated during storage
     *        of LabeledThingsInFrame correctly.
     */
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);
    // @TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThingGroup',
      () => db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingGroupIncomplete'), {
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
   * Returns the next incomplete labeled things in frame.
   * The count can be specified, the default is one.
   *
   * @param {Task} task
   *
   * @returns {AbortablePromise<Array.<LabeledThingInFrame>>|Error}
   */
  getNextIncomplete(task) { // eslint-disable-line no-unused-vars
    const count = 1;
    const startkey = [task.id, true];
    const endkey = [task.id, true];

    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute('labeledThingGroup', () => {
      return db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingGroupIncomplete'), {
        startkey,
        endkey,
        limit: count,
        include_docs: true,
      })
        .then(incompleteDocumentResult => {
          const ltg = incompleteDocumentResult.rows[0];
          return this._couchDbModelDeserializer.deserializeLabeledThingGroup(ltg.doc, task);
        })
        .then(labeledThingGroup => {
          const ltgifs = this._getAssociatedLTGIFsForLTG(labeledThingGroup);
          const frameRange = this._getFrameIndexRangeForLabeledThingGroupWithoutPackagingExecutor(labeledThingGroup);
          return this._$q.all([this._$q.resolve(labeledThingGroup), ltgifs, frameRange]);
        })
        .then(([labeledThingGroup, labeledThingGroupInFrames, frameRange]) => {
          const result = {};

          const firstIncompleteLabeledThingGroupInFrame = labeledThingGroupInFrames.find(ltgif => ltgif.incomplete);
          if (firstIncompleteLabeledThingGroupInFrame !== undefined) {
            result.frameIndex = firstIncompleteLabeledThingGroupInFrame.frameIndex;
          } else {
            result.frameIndex = frameRange.startFrameIndex;
          }

          result.labeledThingGroup = labeledThingGroup;

          return result;
        });
    });
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

    let updatedLabeledThingGroupInFrame;

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
          })
          .then(document => {
            updatedLabeledThingGroupInFrame = document;
            return this._saveLabeledThingGroupWithoutPackagingExecutor(task, updatedLabeledThingGroupInFrame.labeledThingGroup);
          })
          .then(() => {
            return updatedLabeledThingGroupInFrame;
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
  'entityIdService',
  'pouchDbViewService',
  'ghostingService',
  'currentUserService',
  'labelStructureService',
];

export default LabeledThingGroupGateway;
