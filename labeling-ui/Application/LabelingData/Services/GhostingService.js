import {cloneDeep} from 'lodash';

import LabeledThingInFrame from '../Models/LabeledThingInFrame';

class GhostingService {
  /**
   * @param {angular.$q} $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbViewService} pouchDbViewService
   */
  constructor($q, pouchDbContextService, pouchDbViewService) {
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
   * @param {Array} ltifList
   * @param {Function} fn
   * @returns {Promise}
   * @private
   */
  _serializePromiseEach(ltifList, fn) {
    const promise = this._$q.resolve();

    return ltifList.reduce((previousPromise, currentLtif) => {
      return previousPromise.then(() => fn(currentLtif));
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
      task: ltif.labeledThing.task,
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
];

export default GhostingService;
