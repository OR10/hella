import LabeledThingInFrame from '../Models/LabeledThingInFrame';
import LabeledThing from '../Models/LabeledThing';
import LabeledThingsInFrameGateway from './LabeledThingInFrameGateway';

/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class CachingLabeledThingInFrameGateway extends LabeledThingsInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortable
   * @param {CacheService} cache
   * @param {LoggerService} logger
   */
  constructor(apiService, bufferedHttp, $q, abortable, cache, logger) {
    super(apiService, bufferedHttp);

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortable = abortable;

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
     * @type {LoggerService}
     * @private
     */
    this._logger = logger;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameNumber`
   *
   * Ghosts will not be outputted here, only *real* {@link LabeledThingInFrame} objects
   *
   * @param {Task} task
   * @param {Number} frameNumber
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber, offset = 0, limit = 1) {
    const start = frameNumber + offset;
    const end = start + limit - 1;
    const cacheKeys = this._generateLtifCacheKeysForRange(task.id, start, end).map(obj => obj.key);

    if (this._ltifCache.hasAll(cacheKeys.map(key => `${key}.complete`))) {
      const ltifDataMap = this._collapseLtifDataList(this._ltifCache.getAll(cacheKeys));
      const ltDataObj = this._retrieveLtForLtifFromCache(ltifDataMap);
      if (ltDataObj !== false) {
        this._logger.log('cache:labeledThingInFrame', `Cache Hit (listLabeledThingInFrame) {start: ${start}, end: ${end}}`);
        return this._resolve(
          this._createLabeledThingsInFrameByCacheData(task, ltifDataMap, ltDataObj)
        );
      }
      // If data is not available proceed fetching it
    }

    // No cache available
    this._logger.log('cache:labeledThingInFrame', `Cache Miss (listLabeledThingInFrame) {start: ${start}, end: ${end}}`);
    return super.listLabeledThingInFrame(task, frameNumber, offset, limit)
      .then(labeledThingsInFrames => {
        // Mark the retrieved frames as complete
        cacheKeys.map(key => `${key}.complete`).forEach(key => this._ltifCache.store(key, true));

        labeledThingsInFrames.forEach(labeledThingInFrame => {
          const labeledThing = labeledThingInFrame.labeledThing;
          this._ltifCache.store(`${task.id}.${labeledThingInFrame.frameNumber}.${labeledThingInFrame.id}`, labeledThingInFrame.toJSON());
          this._ltCache.store(`${task.id}.${labeledThing.id}`, labeledThing.toJSON());
        });

        return labeledThingsInFrames;
      });
  }


  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameNumber`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameNumber`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param {Task} task
   * @param {int} frameNumber
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameNumber, labeledThing, offset = 0, limit = 1) {
    const start = frameNumber + offset;
    const end = start + limit - 1;

    const cacheResult = this._lookupLabeledThingInFrame(task, labeledThing, start, end);
    if (cacheResult !== false) {
      this._logger.log('cache:labeledThingInFrame', `Cache Hit (getLabeledThingInFrame) {start: ${start}, end: ${end}, labeledThingId: ${labeledThing.id}}`);
      return this._resolve(cacheResult);
    }

    this._logger.log('cache:labeledThingInFrame', `Cache Miss (getLabeledThingInFrame) {start: ${start}, end: ${end}, labeledThingId: ${labeledThing.id}}`);
    return super.getLabeledThingInFrame(task, frameNumber, labeledThing, offset, limit)
      .then(labeledThingInFrames => {
        labeledThingInFrames.forEach(labeledThingInFrame =>
          this._updateSingleLabeledThingInFrameInCache(labeledThingInFrame)
        );

        return labeledThingInFrames;
      });
  }

  _lookupLabeledThingInFrame(task, labeledThing, start, end) {
    const ltifKeys = this._generateLtifCacheKeysForRange(task.id, start, end);

    const ltifDataByFrameMap = new Map();

    // Find all non ghosted ltifs in cache matching our range
    // We don't care for complete frames here only the specific ltif assigned to the given lt
    ltifKeys.forEach(ltifKey => {
      const ltifDataMap = this._ltifCache.get(ltifKey.key);
      if (ltifDataMap === undefined) {
        ltifDataByFrameMap.set(ltifKey.frame, undefined);
        return;
      }

      ltifDataByFrameMap.set(ltifKey.frame, this._extractLtifByLt(ltifDataMap, labeledThing.id));
    });

    // Try to fill up holes from ghost cache
    // 1. Find first non ghost
    const firstLtif = this._extractFirstFromIterator(
      ltifDataByFrameMap.values(),
      ltifData => ltifData !== undefined
    );

    // If no ltif could be found at all we have a cache miss
    if (firstLtif === undefined) {
      return false;
    }

    let lastNonGhost = false;
    // 2. Try to fill up holes from start to the firstLtif
    lastNonGhost = this._fillUpLtifHoles(ltifDataByFrameMap, task.id, firstLtif.labeledThingId, 0);
    if (lastNonGhost === false) {
      return false;
    }

    // 3. Try to fill up holes after first non-ghost
    while (lastNonGhost.frame < end) {
      lastNonGhost = this._fillUpLtifHoles(ltifDataByFrameMap, task.id, lastNonGhost.ltifData.labeledThingId, lastNonGhost.frame + 1);
      if (lastNonGhost === false) {
        return false;
      }
    }

    // We have found all the requested ltifs. Let's build them up and return them
    return this._mapIterator(ltifDataByFrameMap.values(), ltifData =>
      new LabeledThingInFrame(
        Object.assign({}, ltifData, {labeledThing})
      )
    );
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    const {frameNumber, labeledThing, labeledThing: {task}} = labeledThingInFrame;
    this._invalidateGhostsFor(labeledThingInFrame);

    this._ltifCache.invalidate(`${task.id}.${frameNumber}.${labeledThingInFrame.id}`);
    const invalidatedFrameCompletion = this._ltifCache.has(`${task.id}.${frameNumber}.${labeledThingInFrame.id}.complete`);
    this._ltifCache.invalidate(`${task.id}.${frameNumber}.${labeledThingInFrame.id}.complete`);

    //@TODO: ghostClasses?

    return super.saveLabeledThingInFrame(labeledThingInFrame)
      .then(newLabeledThingInFrame => {
        const newLabeledThing = newLabeledThingInFrame.labeledThing;
        const ltifKey = `${task.id}.${frameNumber}.${newLabeledThingInFrame.id}`;
        const ltKey = `${task.id}.${newLabeledThing.id}`;

        // Restore frame completion after update, if it was set before
        if (invalidatedFrameCompletion) {
          this._ltifCache.store(`${ltifKey}.complete`, true);
        }

        this._ltifCache.store(ltifKey, newLabeledThingInFrame.toJSON());
        this._ltCache.store(ltKey, newLabeledThing.toJSON());

        return newLabeledThingInFrame;
      });
  }

  _invalidateGhostsFor(labeledThingInFrame) {
    const {frameNumber, labeledThing, labeledThing: {task}} = labeledThingInFrame;
    let currentFrame = null;

    // 1. Invalidate any associated ghost at the new frameNumber
    this._ltifGhostCache.invalidate(`${task.id}.${frameNumber}.${labeledThing.id}`);

    // 2. Find and invalidate all ghosts right of the labeledThingInFrame belonging to the same labeledThing
    //    Abort the search once the next associated non-ghost labeledThingInFrame is found
    currentFrame = frameNumber + 1;
    while (currentFrame <= task.frameRange.endFrameNumber) {
      // Lookup if there is a real ltif here
      const frameLtifMap = this._ltifCache.get(`${task.id}.${currentFrame}`);
      if (frameLtifMap !== undefined) {
        const ltifData = this._extractLtifByLt(frameLtifMap, labeledThing.id);
        if (ltifData !== undefined) {
          // We found the next non-ghost ltif, we can abort cache invalidation here
          break;
        }
      }

      this._ltifGhostCache.invalidate(`${task.id}.${frameNumber}.${labeledThing.id}`);

      currentFrame += 1;
    }

    // 3. Find and invalidate all ghosts left of the labeledThingInFrame belonging to the same labeledThing
    //    Abort the search once the next associated non-ghost labeledThingInFrame is found.
    //    This is needed, as the update could be the first Ltif, which would imply ghost propagation back to the start
    //    frame.
    currentFrame = frameNumber - 1;
    while (currentFrame >= task.frameRange.startFrameNumber) {
      // Lookup if there is a real ltif here
      const frameLtifMap = this._ltifCache.get(`${task.id}.${currentFrame}`);
      if (frameLtifMap !== undefined) {
        const ltifData = this._extractLtifByLt(frameLtifMap, labeledThing.id);
        if (ltifData !== undefined) {
          // We found the next non-ghost ltif, we can abort cache invalidation here
          break;
        }
      }

      this._ltifGhostCache.invalidate(`${task.id}.${frameNumber}.${labeledThing.id}`);

      currentFrame -= 1;
    }
  }

  _fillUpLtifHoles(ltifDataByFrameMap, taskId, ltId, startFrame) {
    let lastFrame = startFrame;
    let lastLtifData = null;
    for (let [frame, ltifData] of ltifDataByFrameMap.entries()) {
      if (frame < startFrame) {
        continue;
      }
      lastFrame = frame;
      lastLtifData = ltifData;

      // Stop at the next non-ghost ltif
      if (ltifData !== undefined && ltifData.ghost === false) {
        break;
      }

      const ghostLtifKey = `${taskId}.${frame}.${ltId}`;
      const ghostLtifData = this._ltifGhostCache.get(ghostLtifKey);

      if (ghostLtifData === undefined) {
        return false;
      }

      lastLtifData = ghostLtifData;

      ltifDataByFrameMap.set(frame, ghostLtifData);
    }

    return {frame: lastFrame, ltifData: lastLtifData, ghost: lastLtifData.ghost}
  }

  _extractLtifByLt(ltifDataMap, ltId) {
    if (ltifDataMap === undefined) {
      return undefined;
    }

    return this._extractFirstFromIterator(
      ltifDataMap.values(),
      ltifData => ltifData.labeledThingId === ltId
    );
  }

  _extractFirstFromIterator(iterator, condition = () => true) {
    let current;
    while (true) {
      current = iterator.next();
      if (current.done) {
        break;
      }

      if (condition(current.value)) {
        return current.value;
      }
    }

    return undefined;
  }


  /**
   * Store a single LabeledThing to the cache
   *
   * Ghosts are automatically separated from their real counterparts
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _updateSingleLabeledThingInFrameInCache(labeledThingInFrame) {
    const {ghost, labeledThing, labeledThing: {task}} = labeledThingInFrame;
    const ltCacheKey = `${task.id}.${labeledThing.id}`;

    if (ghost === true) {
      const ltifCacheKey = `${task.id}.${labeledThingInFrame.frameNumber}.${labeledThing.id}`;
      this._ltifGhostCache.store(ltifCacheKey, labeledThingInFrame.toJSON());
    } else {
      const ltifCacheKey = `${task.id}.${labeledThingInFrame.frameNumber}.${labeledThingInFrame.id}`;
      this._ltifCache.store(ltifCacheKey, labeledThingInFrame.toJSON());
    }

    this._ltCache.store(ltCacheKey, labeledThing.toJSON());
  }

  /**
   * Generate labeledThingsInFrame-by-frame cache keys for a certain frame range
   *
   * @param taskId
   * @param start
   * @param end
   * @returns {Array.<string>}
   * @private
   */
  _generateLtifCacheKeysForRange(taskId, start, end) {
    const count = end - start + 1;
    const cacheKeys = new Array(count).fill(null).map(
      (_, index) => ({key: `${taskId}.${start + index}`, frame: start + index})
    );
    return cacheKeys;
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

  /**
   * @param {Array.<Map>} ltifDataList
   * @returns {Map}
   * @private
   */
  _collapseLtifDataList(ltifDataList) {
    const collapsedLtifDataMap = new Map();
    ltifDataList.map(ltifDataMap =>
      ltifDataMap.forEach((value, key) =>
        collapsedLtifDataMap.set(key, value)
      )
    );

    return collapsedLtifDataMap;
  }

  /**
   * @param {Map.<Object>} ltifDataMap
   * @returns {Object}
   * @private
   */
  _retrieveLtForLtifFromCache(ltifDataMap) {
    const ltDataObj = {};
    let allFound = true;
    ltifDataMap.forEach(ltifData => {
      const ltKey = `${task.id}.${ltifData.labeledThingId}`;

      if (allFound === false || !this._ltCache.has(ltKey)) {
        allFound = false;
        return;
      }

      const ltData = this._ltCache.get(ltKey);
      ltDataObj[ltData.id] = ltData;
    });

    if (allFound === false) {
      return false;
    }

    return ltDataObj;
  }

  _mapIterator(iterator, mapper) {
    const result = [];
    let index = 0;
    let current;
    while (true) {
      current = iterator.next();
      if (current.done) {
        break;
      }
      if (current.length !== undefined) {
        result.push(mapper(current.value[1], current.value[0]));
      } else {
        result.push(mapper(current.value, index));
      }

      index += 1;
    }

    return result;
  }

  /**
   * @param {Task} task
   * @param {Map.<Object>} ltifDataMap
   * @param {Map.<Object>} ltDataMap
   * @returns {Array.<LabeledThingInFrame>}
   * @private
   */
  _createLabeledThingsInFrameByCacheData(task, ltifDataMap, ltDataMap) {
    return this._mapIterator(ltifDataMap.values(), ltifData => {
      return new LabeledThingInFrame(
        Object.assign({}, ltifData, {
          labeledThing: new LabeledThing(
            Object.assign({}, ltDataMap.get(ltifData.labeledThingId), {task})
          ),
        })
      );
    });
  }
}

CachingLabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'abortablePromiseFactory',
  'cacheService',
  'loggerService',
];

export default CachingLabeledThingInFrameGateway;
