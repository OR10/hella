import LabeledThing from '../Models/LabeledThing';

import LabeledThingGateway from './LabeledThingGateway';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s
 */
class CachingLabeledThingGateway extends LabeledThingGateway {
  /**
   * @param {ApiService} apiService
   * @param {RevisionManager} revisionManager
   * @param {BufferedHttp} bufferedHttp
   * @param {CacheService} cache
   * @param {angular.$q} $q
   * @param {AbortablePromiseFactory} abortable
   * @param {FrameIndexService} frameIndexService
   */
  constructor(apiService, revisionManager, bufferedHttp, cache, $q, abortable, frameIndexService) {
    super(apiService, revisionManager, bufferedHttp);

    /**
     * @type {DataContainer}
     * @private
     */
    this._ltifCache = cache.container('labeledThingsInFrame-by-frame');

    /**
     * @type {DataContainer}
     * @private
     */
    this._ltifGhostCache = cache.container('ghosted-labeledThingsInFrame-by-id');

    /**
     * @type {DataContainer}
     * @private
     */
    this._ltCache = cache.container('labeledThing-by-id');

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortable = abortable;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const {task} = labeledThing;
    const oldLtData = this._ltCache.get(`${task.id}.${labeledThing.id}`);

    // Invalidate old LabeledThing
    this._ltCache.invalidate(`${task.id}.${labeledThing.id}`);

    // Invalidate LabeledThingsInFrame, which are now outside of the frameRange
    if (
      oldLtData && (
        oldLtData.frameRange.startFrameIndex !== labeledThing.frameRange.startFrameIndex ||
        oldLtData.frameRange.endFrameIndex !== labeledThing.frameRange.endFrameIndex
      )
    ) {
      this._invalidateLtifCacheOutsideOfFrameRange(task, oldLtData, labeledThing);
    }

    return super.saveLabeledThing(labeledThing)
      .then(storedLabeledThing => {
        const taskId = storedLabeledThing.task.id;
        const thingId = storedLabeledThing.id;
        this._ltCache.store(`${taskId}.${thingId}`, storedLabeledThing.toJSON());
        return storedLabeledThing;
      });
  }

  /**
   * @param {Task} task
   * @param {string} labeledThingId
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  getLabeledThing(task, labeledThingId) {
    const cacheKey = `${task.id}.${labeledThingId}`;
    if (this._ltCache.has(cacheKey)) {
      return this._resolve(
        new LabeledThing(
          Object.assign({}, this._ltCache.get(cacheKey), {task})
        )
      );
    }

    return super.getLabeledThing(task, labeledThingId)
      .then(labeledThing => {
        this._ltCache.store(cacheKey, labeledThing.toJSON());
        return labeledThing;
      });
  }

  /**
   * Delete a {@link LabeledThing} and all its descending {@link LabeledThingInFrame} objects
   *
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise}
   */
  deleteLabeledThing(labeledThing) {
    const {task} = labeledThing;
    const ltKey = `${task.id}.${labeledThing.id}`;

    // 1. Invalidate the labeledThing itself
    this._ltCache.invalidate(ltKey);

    // 2. Invalidate all associated ltifs
    this._invalidateAllByLabeledThing(this._ltifCache.get(task.id), labeledThing);

    // 3. Invalidate all associated ltif ghosts
    this._invalidateAllByLabeledThing(this._ltifGhostCache.get(task.id), labeledThing);

    return super.deleteLabeledThing(labeledThing);
  }

  /**
   * @param {Task} task
   * @param {Object} oldLtData
   * @param {LabeledThing} labeledThing
   *
   * @private
   */
  _invalidateLtifCacheOutsideOfFrameRange(task, oldLtData, labeledThing) {
    let ltifCacheKeys = [];

    const beforeStart = Math.min(oldLtData.frameRange.startFrameIndex, labeledThing.frameRange.startFrameIndex);
    const beforeEnd = Math.max(oldLtData.frameRange.startFrameIndex, labeledThing.frameRange.startFrameIndex);
    const afterStart = Math.min(oldLtData.frameRange.endFrameIndex, labeledThing.frameRange.endFrameIndex);
    const afterEnd = Math.max(oldLtData.frameRange.endFrameIndex, labeledThing.frameRange.endFrameIndex);

    if (beforeStart !== beforeEnd) {
      ltifCacheKeys = ltifCacheKeys.concat(
        this._generateLtifCacheKeysForRange(task.id, labeledThing.id, beforeStart + 1, beforeEnd)
      );
    }

    if (afterStart !== afterEnd) {
      ltifCacheKeys = ltifCacheKeys.concat(
        this._generateLtifCacheKeysForRange(task.id, labeledThing.id, afterStart + 1, afterEnd)
      );
    }

    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    const ltifGhostCacheKeys = this._generateLtifGhostCacheKeysForRange(
      task.id,
      labeledThing.id,
      frameIndexLimits.lowerLimit,
      frameIndexLimits.upperLimit
    );

    ltifCacheKeys.forEach(key => this._ltifCache.invalidate(key));
    ltifGhostCacheKeys.forEach(keyStruct => this._ltifGhostCache.invalidate(keyStruct.key));
  }

  _invalidateAllByLabeledThing(cacheMap, labeledThing) {
    if (cacheMap === undefined) {
      return;
    }

    cacheMap.forEach((entry, cacheId) => {
      if (entry instanceof Map) {
        return this._invalidateAllByLabeledThing(entry, labeledThing);
      }

      if (entry.labeledThingId === labeledThing.id) {
        cacheMap.delete(cacheId);
      }
    });
  }

  _generateLtifGhostCacheKeysForRange(taskId, labeledThingId, start, end) {
    const count = end - start + 1;
    const cacheKeys = new Array(count).fill(null).map(
      (_, index) => ({key: `${taskId}.${start + index}.${labeledThingId}`, frame: start + index})
    );
    return cacheKeys;
  }

  _generateLtifCacheKeysForRange(taskId, labeledThingId, start, end) {
    const invalidationCacheKeys = [];
    for (let frameIndex = start; frameIndex < end; frameIndex++) {
      const frameData = this._ltifCache.get(`${taskId}.${frameIndex}`);

      if (frameData === undefined) {
        continue;
      }
      frameData.forEach(ltifData => { // eslint-disable-line no-loop-func
        if (ltifData.labeledThingId === labeledThingId) {
          invalidationCacheKeys.push(`${taskId}.${frameIndex}.${ltifData.id}`);
        }
      });
    }

    return invalidationCacheKeys;
  }

  /**
   * Directly resolve with an abortable promise
   *
   * @param {*} value
   * @returns {AbortablePromise}
   * @private
   */
  _resolve(value) {
    return this._abortable(this._$q.resolve(value));
  }
}

CachingLabeledThingGateway.$inject = [
  'ApiService',
  'revisionManager',
  'bufferedHttp',
  'cacheService',
  '$q',
  'abortablePromiseFactory',
  'frameIndexService',
];

export default CachingLabeledThingGateway;
