import {cloneDeep} from 'lodash';

import LabeledThingInFrame from '../Models/LabeledThingInFrame';
import LabeledThingGroupInFrame from '../Models/LabeledThingGroupInFrame';

class GhostingService {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbViewService} pouchDbViewService
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {EntityIdService} entityIdService
   */
  constructor(
    $q,
    pouchDbContextService,
    pouchDbViewService,
    couchDbModelDeserializer,
    revisionManager,
    entityIdService
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
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

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
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;
  }

  /**
   *
   * @param {int} frameIndex
   * @param {int} offset
   * @param {int} limit
   * @param {Object<{startFrameIndex, endFrameIndex}>} frameRange
   * @param {Array.<LabeledThingInFrame>} labeledThingsInFrames
   */
  calculateShapeGhostsForLabeledThingInFrames(frameIndex, offset, limit, frameRange, labeledThingsInFrames) {
    if (labeledThingsInFrames.length === 0) {
      throw new Error(`Can not calculate ghosts if no LabeledThingsInFrame are given`);
    }
    const startKey = frameIndex + offset;
    const endKey = frameIndex + offset + limit;

    // Create a lookup table mapping frame index to ltif
    const labeledThingInFrameLookUpTable = new Map();
    labeledThingsInFrames.forEach(ltif => labeledThingInFrameLookUpTable.set(ltif.frameIndex, ltif));

    let foundLtif = null;
    let result = [];
    let counter = 1;

    const endIndex = Math.max(frameRange.endFrameIndex, endKey);

    // Walk through all frame indices in reverse order
    for (let index = endIndex; index >= 0; index--, counter++) {
      const hasLtifForCurrentIndex = labeledThingInFrameLookUpTable.has(index);
      // If there is a ltif for the current frame index start ghost creation
      if (hasLtifForCurrentIndex || index === 0) {
        // in case index == 0 we need to check if there is a ltif for this case
        if (hasLtifForCurrentIndex) {
          foundLtif = labeledThingInFrameLookUpTable.get(index);
        } else {
          // If we are at index 0 and there is no given ltif there, copy last found and set frameIndex to 0
          foundLtif = this._createGhostLabeledThingInFrameForPartialSequence(foundLtif, foundLtif.frameIndex * -1);
        }
        // Create clones of found ltif from current frameindex up to the last found/end
        let partialLabeledThingInFrameSequence = new Array(counter).fill(foundLtif);
        // Update frame indices for ghost ltifs and concat to result ltif array
        partialLabeledThingInFrameSequence = partialLabeledThingInFrameSequence.map(this._createGhostLabeledThingInFrameForPartialSequence);
        result = partialLabeledThingInFrameSequence.concat(result);
        counter = 0;
      }
    }
    // Replace ghosts with real ltifs
    result = result.map(ltifGhost => {
      if (labeledThingInFrameLookUpTable.has(ltifGhost.frameIndex)) {
        return labeledThingInFrameLookUpTable.get(ltifGhost.frameIndex);
      }
      return ltifGhost;
    });

    return result.slice(startKey, endKey);
  }

  /**
   * @param {Array.<LabeledThingInFrame>} labeledThingsInFrames
   * @return {Promise.<Array.<LabeledThingInFrame>>}
   */
  calculateClassGhostsForLabeledThingsInFrames(labeledThingsInFrames) {
    const labeledThingInFrameClassesPropagationCache = new Map();
    const labeledThingInFrameClones = labeledThingsInFrames.map(ltif => ltif.clone());

    return this._$q.resolve()
      .then(() => this._sortLabeledThingsInFrame(labeledThingInFrameClones))
      .then(sortedLtifs => {
        const result = [];

        return this._serializePromiseEach(sortedLtifs, labeledThingInFrame => {
          const labeledThingId = labeledThingInFrame.labeledThing.id;

          if (labeledThingInFrame.classes.length > 0) {
            labeledThingInFrameClassesPropagationCache.set(labeledThingId, labeledThingInFrame.classes);
            result.push(labeledThingInFrame);

            return null;
          }

          return this._$q.resolve().then(() => {
            if (!labeledThingInFrameClassesPropagationCache.has(labeledThingId)) {
              return this._getPreviousLabeledThingInFrameClasses(labeledThingInFrame)
                .then(previousLabeledThingInFrameClasses => {
                  labeledThingInFrameClassesPropagationCache.set(labeledThingId, previousLabeledThingInFrameClasses);
                })
                .catch(() => {
                  labeledThingInFrameClassesPropagationCache.set(labeledThingId, null);
                });
            }
          })
            .then(() => {
              labeledThingInFrame.ghostClasses = labeledThingInFrameClassesPropagationCache.get(labeledThingId);

              result.push(labeledThingInFrame);
            });
        })
          .then(() => result);
      });
  }

  /**
   * Retrieve the {@link LabeledThingGroupInFrame} for a specific {@link LabeledThingGroup} and a frameIndex.
   *
   * If there is no {@link LabeledThingGroupInFrame} associated with the given {@link LabeledThingGroup} on the
   * specified `frameIndex` stored inside the datastore `undefined` will be returned.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @param {number} frameIndex
   * @returns {LabeledThingGroupInFrame|undefined}
   * @private
   */
  _getLabeledThingGroupsInFrameForLabeledThingGroupAndFrameIndex(labeledThingGroup, frameIndex) {
    const task = labeledThingGroup.task;
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._$q.resolve()
      .then(
        () => dbContext.query(
          this._pouchDbViewService.getDesignDocumentViewName(
            'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex'
          ),
          {
            include_docs: true,
            startkey: [labeledThingGroup.id, frameIndex],
            endkey: [labeledThingGroup.id, frameIndex],
          }
        )
      )
      .then(results => {
        if (results.rows.length === 0) {
          // No corresponding ltgif found
          return undefined;
        }

        const ltgifDocument = results.rows[0].doc;

        this._revisionManager.extractRevision(ltgifDocument);
        return this._couchDbModelDeserializer.deserializeLabeledThingGroupInFrame(ltgifDocument, labeledThingGroup);
      });
  }

  /**
   * Retrieve/Create/Calculate {@link LabeledThingGroupInFrame} models for a bunch of
   * {@link LabeledThingGroup}s and a specific frameIndex
   *
   * This method enforces ghost generation for the given LTGs. Therefore it should only be called
   * on LTGs, which do not have LTGIFs on the given frameIndex.
   *
   * @param {LabeledThingGroup[]} labeledThingGroupsToBeGhosted
   * @param {number} frameIndex
   * @returns {Promise.<LabeledThingGroupInFrame[]>}
   * @private
   */
  _getLabeledThingGroupInFrameGhostsForLabeledThingGroups(labeledThingGroupsToBeGhosted, frameIndex) {
    return this._$q.resolve()
      .then(
        // Try and find a LabeledThingGroupInFrame before the current frameIndex for each of the LabeledThingGroups
        () => this._$q.all(
          labeledThingGroupsToBeGhosted.map(
            labeledThingGroup => this._getPreviousLabeledThingGroupInFrameForLabeledThinGroupAndFrameIndex(
              labeledThingGroup,
              frameIndex
            )
          )
        )
      )
      .then(labeledThingGroupInFrameGhostCandidates => {
        const labeledThingInFramesWithNoGhost = labeledThingGroupsToBeGhosted
          .filter(
            (labeledThingGroup, index) => labeledThingGroupInFrameGhostCandidates[index] === undefined
          )
          .map(labeledThingGroup => {
            return new LabeledThingGroupInFrame({
              id: this._entityIdService.getUniqueId(),
              classes: [],
              task: labeledThingGroup.task,
              incomplete: true,
              frameIndex,
              labeledThingGroup,
            });
          });

        const labeledThingInFrameGhosts = labeledThingGroupInFrameGhostCandidates
          .filter(
            ghostCandidate => ghostCandidate !== undefined
          )
          .map(
            ghostCandidate => {
              // Ghost 'em!
              ghostCandidate.id = this._entityIdService.getUniqueId();
              ghostCandidate.frameIndex = frameIndex;
            }
          );

        return [...labeledThingInFrameGhosts, ...labeledThingInFramesWithNoGhost];
      });
  }

  /**
   * Try to find a {@link LabeledThingGroupInFrame} for the given {@link LabeledThingGroup}, which lies
   * before the given `frameIndex`.
   *
   * If no such {@link LabeledThingGroupInFrame} could be found `undefined` is returned.
   *
   * The document is unmodified. Therefore it will have its original frameIndex.
   * Take this into account if you are using it as a ghost.
   *
   * @param {LabeledThingGroup} labeledThingGroup
   * @param {number} frameIndex
   * @results {Promise.<LabeledThingGroupInFrame|undefined>}
   * @private
   */
  _getPreviousLabeledThingGroupInFrameForLabeledThinGroupAndFrameIndex(labeledThingGroup, frameIndex) {
    const task = labeledThingGroup.task;
    const taskId = task.id;
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._$q.resolve()
      .then(
        () => dbContext.query(
          this._pouchDbViewService.getDesignDocumentViewName(
            'labeledThingGroupInFrameByLabeledThingGroupIdAndFrameIndex'),
          {
            include_docs: true,
            startkey: [labeledThingGroup.id, 0],
            endkey: [labeledThingGroup.id, frameIndex - 1],
            descending: true,
            limit: 1,
          }
        )
      )
      .then(results => {
        if (results.rows.length === 0) {
          // No match before frameIndex found
          return undefined;
        }

        const ltgifDocument = results.rows[0].doc;

        this._revisionManager.extractRevision(ltgifDocument);
        return this._couchDbModelDeserializer.deserializeLabeledThingGroupInFrame(ltgifDocument, labeledThingGroup);
      });
  }

  /**
   * Retrieve a correctly ghosted list of {@link LabeledThingGroupInFrame} objects
   * based on a list of {@link LabeledThingGroup} models and a specific frameIndex.
   *
   * @param {LabeledThingGroup[]} labeledThingGroups
   * @param {number} frameIndex
   * @returns {Promise.<LabeledThingGroupInFrame[]>}
   */
  calculateClassGhostsForLabeledThingGroupsAndFrameIndex(labeledThingGroups, frameIndex) {
    return this._$q.resolve()
      .then(
        () => this._$q.all(
          labeledThingGroups.map(
            labeledThingGroup => this._getLabeledThingGroupsInFrameForLabeledThingGroupAndFrameIndex(
              labeledThingGroup,
              frameIndex
            )
          )
        )
      )
      .then(loadedLabeledThingGroupInFrames => {
        const labeledThingGroupsToBeGhosted = labeledThingGroups.filter(
          (labeledThingGroup, index) => loadedLabeledThingGroupInFrames[index] === undefined
        );

        const actualLabeledThingGroupInFrames = loadedLabeledThingGroupInFrames.filter(
          labeledThingGroupInFrameCandidate => labeledThingGroupInFrameCandidate !== undefined
        );

        return this._$q.all([
          actualLabeledThingGroupInFrames,
          this._getLabeledThingGroupInFrameGhostsForLabeledThingGroups(
            labeledThingGroupsToBeGhosted,
            frameIndex
          ),
        ]);
      })
      .then(
        ([actualLabeledThingGroupInFrames, ghostedLabeledThingGroupInFrames]) => {
          return [...actualLabeledThingGroupInFrames, ...ghostedLabeledThingGroupInFrames];
        }
      );
  }

  /**
   * @param {Array} list
   * @param {Function} fn
   * @returns {Promise}
   * @private
   */
  _serializePromiseEach(list, fn) {
    const promise = this._$q.resolve();

    return list.reduce((previousPromise, current) => {
      return previousPromise.then(() => fn(current));
    }, promise);
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _getPreviousLabeledThingInFrameClasses(labeledThingInFrame) {
    const labeledThing = labeledThingInFrame.labeledThing;
    const db = this._pouchDbContextService.provideContextForTaskId(labeledThing.task.id);
    const startkey = [labeledThing.id, labeledThingInFrame.frameIndex];
    const endkey = [labeledThing.id, 0];

    return db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByFrameIndexWithClasses'), {
      startkey,
      endkey,
      include_docs: true,
      limit: 1,
      descending: true,
    })
      .then(result => {
        if (result.rows.length === 0) {
          return this._$q.reject('Found no previous ltif with classes');
        }
        return result.rows[0].doc.classes;
      });
  }

  /**
   * @param {LabeledThingInFrame} ltif
   * @param {int} localGhostIndex
   * @return {LabeledThingInFrame}
   * @private
   */
  _createGhostLabeledThingInFrameForPartialSequence(ltif, localGhostIndex) {
    return new LabeledThingInFrame({
      id: null,
      classes: [],
      ghostClasses: null,
      incomplete: false,
      frameIndex: ltif.frameIndex + localGhostIndex,
      labeledThing: ltif.labeledThing,
      identifierName: ltif.identifierName,
      shapes: cloneDeep(ltif.shapes),
      ghost: true,
    });
  }

  /**
   * Sorts the given array of ltifs by its frame index
   *
   * @param {Array.<LabeledThingInFrame>} labeledThingInFrames
   * @return {Array.<LabeledThingInFrame>}
   * @private
   */
  _sortLabeledThingsInFrame(labeledThingInFrames) {
    return labeledThingInFrames.sort((first, second) => {
      if (first.frameIndex < second.frameIndex) {
        return -1;
      }
      if (first.frameIndex > second.frameIndex) {
        return 1;
      }

      return 0;
    });
  }
}

GhostingService.$inject = [
  '$q',
  'pouchDbContextService',
  'pouchDbViewService',
  'couchDbModelDeserializer',
  'revisionManager',
  'entityIdService',
];

export default GhostingService;
