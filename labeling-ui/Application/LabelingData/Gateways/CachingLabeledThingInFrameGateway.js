import {equals} from 'angular';
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
   * @param {FrameIndexService} frameIndexService
   */
  constructor(apiService,
              bufferedHttp,
              $q,
              abortable,
              cache,
              logger,
              frameIndexService) {
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

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameIndex`
   *
   * Ghosts will not be outputted here, only *real* {@link LabeledThingInFrame} objects
   *
   * @param {Task} task
   * @param {Number} frameIndex
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameIndex, offset = 0, limit = 1) {
    const start = frameIndex + offset;
    const end = start + limit - 1;
    const cacheKeys = this._generateLtifCacheKeysForRange(task.id, start, end).map(obj => obj.key);

    if (this._ltifCache.hasAll(cacheKeys.map(key => `${key}.complete`))) {
      const ltifDataMap = this._filterCompleteEntries(
        this._collapseLtifDataList(
          this._ltifCache.getAll(cacheKeys)
        )
      );
      const ltDataMap = this._retrieveLtForLtifFromCache(task, ltifDataMap);
      if (ltDataMap !== false) {
        this._logger.log('cache:labeledThingInFrame', `Cache Hit (listLabeledThingInFrame) {start: ${start}, end: ${end}}`);
        return this._resolve(
          this._createLabeledThingsInFrameByCacheData(task, ltifDataMap, ltDataMap)
        );
      }
      // If data is not available proceed fetching it
    }

    // No cache available
    this._logger.log('cache:labeledThingInFrame', `Cache Miss (listLabeledThingInFrame) {start: ${start}, end: ${end}}`);
    return super.listLabeledThingInFrame(task, frameIndex, offset, limit)
      .then(labeledThingsInFrames => {
        // Mark the retrieved frames as complete
        cacheKeys.map(key => `${key}.complete`).forEach(key => this._ltifCache.store(key, true));

        labeledThingsInFrames.forEach(labeledThingInFrame => {
          const labeledThing = labeledThingInFrame.labeledThing;
          this._ltifCache.store(`${task.id}.${labeledThingInFrame.frameIndex}.${labeledThingInFrame.id}`, labeledThingInFrame.toJSON());
          this._ltCache.store(`${task.id}.${labeledThing.id}`, labeledThing.toJSON());
        });

        return labeledThingsInFrames;
      });
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
    const start = frameIndex + offset;
    const end = start + limit - 1;

    const cacheResult = this._lookupLabeledThingInFrame(task, labeledThing, start, end);
    if (cacheResult !== false) {
      this._logger.log('cache:labeledThingInFrame', `Cache Hit (getLabeledThingInFrame) {start: ${start}, end: ${end}, labeledThingId: ${labeledThing.id}}`);
      return this._resolve(cacheResult);
    }

    this._logger.log('cache:labeledThingInFrame', `Cache Miss (getLabeledThingInFrame) {start: ${start}, end: ${end}, labeledThingId: ${labeledThing.id}}`);
    return super.getLabeledThingInFrame(task, frameIndex, labeledThing, offset, limit)
      .then(labeledThingInFrames => {
        labeledThingInFrames.forEach(labeledThingInFrame =>
          this._updateSingleLabeledThingInFrameInCache(labeledThingInFrame)
        );

        return labeledThingInFrames;
      });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    const {frameIndex, labeledThing, labeledThing: {task}} = labeledThingInFrame;
    const cachedLabeledThingsInFrame = this._lookupLabeledThingInFrame(task, labeledThing, frameIndex, frameIndex);
    const cachedLabeledThingInFrame = cachedLabeledThingsInFrame === false ? undefined : cachedLabeledThingsInFrame.pop();

    // Ghosts always become invalid for this ltif
    this._invalidateGhostsFor(labeledThingInFrame);

    const classesChanged = (
      cachedLabeledThingInFrame === undefined ||
      (
        cachedLabeledThingInFrame.ghost === false && !equals(cachedLabeledThingInFrame.classes, labeledThingInFrame.classes)
      ) ||
      (
        cachedLabeledThingInFrame.ghost === true && !equals(cachedLabeledThingInFrame.ghostClasses, labeledThingInFrame.classes)
      )
    );

    let invalidatedFrameCompletion = false;
    if (classesChanged) {
      // We need to invalidate all correspondng LabeledThingsInFrame right of this frame, as classes propagate as ghostClasses
      // @TODO if there is no hole in cache data this can be optimized to only invalidate to next ltif with classes.
      this._invalidateLtifsForLt(labeledThing, frameIndex + 1);
    } else {
      // We only need to invalidate this specific ltif
      this._ltifCache.invalidate(`${task.id}.${frameIndex}.${labeledThingInFrame.id}`);
      invalidatedFrameCompletion = this._ltifCache.has(`${task.id}.${frameIndex}.complete`);
      this._ltifCache.invalidate(`${task.id}.${frameIndex}.${labeledThingInFrame.id}.complete`);
    }

    return super.saveLabeledThingInFrame(labeledThingInFrame)
      .then(newLabeledThingInFrame => {
        const newLabeledThing = newLabeledThingInFrame.labeledThing;
        const ltifKey = `${task.id}.${frameIndex}.${newLabeledThingInFrame.id}`;
        const ltKey = `${task.id}.${newLabeledThing.id}`;

        // Restore frame completion after update, if it was set before
        if (invalidatedFrameCompletion) {
          this._ltifCache.store(`${task.id}.${frameIndex}.complete`, true);
        }

        this._ltifCache.store(ltifKey, newLabeledThingInFrame.toJSON());
        this._ltCache.store(ltKey, newLabeledThing.toJSON());

        return newLabeledThingInFrame;
      });
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {number} start
   * @param {number} end
   * @returns {Array.<LabeledThingInFrame>|boolean}
   * @private
   */
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
      // Our whole resultset may consist of ghosts, if we did not find any ltif here
      // Check if we have all ghosts
      const ltifGhostData = [];
      for (let frameIndex = start; frameIndex <= end; frameIndex++) {
        const possibleGhost = this._ltifGhostCache.get(`${task.id}.${frameIndex}.${labeledThing.id}`);
        if (possibleGhost === undefined) {
          // A ghost is missing, we do have a cache miss
          return false;
        }

        ltifGhostData.push(possibleGhost);
      }

      return ltifGhostData.map(ghostData =>
        new LabeledThingInFrame(
          Object.assign({}, ghostData, {labeledThing})
        )
      );
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
   * @param {LabeledThing} labeledThing
   * @param {number} start
   * @private
   */
  _invalidateLtifsForLt(labeledThing, start) {
    const {task} = labeledThing;

    const frameMap = this._ltifCache.get(`${task.id}`);

    frameMap.forEach((ltifMap, frameIndex) => {
      if (frameIndex < start) {
        return;
      }

      const ltifData = this._extractLtifByLt(ltifMap, labeledThing.id);
      if (ltifData === undefined) {
        return;
      }

      this._ltifCache.invalidate(`${task.id}.${frameIndex}.${ltifData.id}`);
      this._ltifCache.invalidate(`${task.id}.${frameIndex}.complete`);
    });
  }

  /**
   * Invalidate the Ghost cache for a certain `LabeledThingInFrame`
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _invalidateGhostsFor(labeledThingInFrame) {
    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();
    const {frameIndex, labeledThing, labeledThing: {task}} = labeledThingInFrame;
    let currentIndex = null;

    // 1. Invalidate any associated ghost at the new frameIndex
    this._ltifGhostCache.invalidate(`${task.id}.${frameIndex}.${labeledThing.id}`);

    // 2. Find and invalidate all ghosts right of the labeledThingInFrame belonging to the same labeledThing
    //    Abort the search once the next associated non-ghost labeledThingInFrame is found
    currentIndex = frameIndex + 1;
    while (currentIndex <= frameIndexLimits.upperLimit) {
      // Lookup if there is a real ltif here
      const frameLtifMap = this._ltifCache.get(`${task.id}.${currentIndex}`);
      if (frameLtifMap !== undefined) {
        const ltifData = this._extractLtifByLt(frameLtifMap, labeledThing.id);
        if (ltifData !== undefined) {
          // We found the next non-ghost ltif, we can abort cache invalidation here
          break;
        }
      }

      this._ltifGhostCache.invalidate(`${task.id}.${currentIndex}.${labeledThing.id}`);

      currentIndex += 1;
    }

    // 3. Find and invalidate all ghosts left of the labeledThingInFrame belonging to the same labeledThing
    //    Abort the search once the next associated non-ghost labeledThingInFrame is found.
    //    This is needed, as the update could be the first Ltif, which would imply ghost propagation back to the start
    //    frame.
    currentIndex = frameIndex - 1;
    while (currentIndex >= frameIndexLimits.lowerLimit) {
      // Lookup if there is a real ltif here
      const frameLtifMap = this._ltifCache.get(`${task.id}.${currentIndex}`);
      if (frameLtifMap !== undefined) {
        const ltifData = this._extractLtifByLt(frameLtifMap, labeledThing.id);
        if (ltifData !== undefined) {
          // We found the next non-ghost ltif, we can abort cache invalidation here
          break;
        }
      }

      this._ltifGhostCache.invalidate(`${task.id}.${currentIndex}.${labeledThing.id}`);

      currentIndex -= 1;
    }
  }

  /**
   * Try to fillup holes in a LtifMap using cached Ghosts
   *
   * This method modified the given `ltifDataByFrameMap`!
   *
   * @param {Map} ltifDataByFrameMap
   * @param {string} taskId
   * @param {string} ltId
   * @param {number} startFrame
   * @returns {Object}
   * @private
   */
  _fillUpLtifHoles(ltifDataByFrameMap, taskId, ltId, startFrame) {
    let lastFrame = startFrame;
    let lastLtifData = null;
    for (const [frame, ltifData] of ltifDataByFrameMap.entries()) {
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

    return {
      frame: lastFrame,
      ltifData: lastLtifData,
      ghost: lastLtifData.ghost,
    };
  }

  /**
   * @param {Map} ltifDataMap
   * @param {string} ltId
   * @returns {Object|undefined}
   * @private
   */
  _extractLtifByLt(ltifDataMap, ltId) {
    if (ltifDataMap === undefined) {
      return undefined;
    }

    return this._extractFirstFromIterator(
      ltifDataMap.values(),
      ltifData => ltifData.labeledThingId === ltId
    );
  }

  /**
   * Extract the first value of an iterator which fullfills a given condition
   *
   * @param {Iterator} iterator
   * @param {Function} condition
   * @returns {*}
   * @private
   */
  _extractFirstFromIterator(iterator, condition = () => true) {
    let current;
    while (true) { // eslint-disable-line no-constant-condition
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
      const ltifCacheKey = `${task.id}.${labeledThingInFrame.frameIndex}.${labeledThing.id}`;
      this._ltifGhostCache.store(ltifCacheKey, labeledThingInFrame.toJSON());
    } else {
      const ltifCacheKey = `${task.id}.${labeledThingInFrame.frameIndex}.${labeledThingInFrame.id}`;
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
   * @param {Task} task
   * @param {Map.<Object>} ltifDataMap
   * @returns {Object}
   * @private
   */
  _retrieveLtForLtifFromCache(task, ltifDataMap) {
    const ltDataMap = new Map();
    let allFound = true;
    ltifDataMap.forEach(ltifData => {
      const ltKey = `${task.id}.${ltifData.labeledThingId}`;

      if (allFound === false || !this._ltCache.has(ltKey)) {
        allFound = false;
        return;
      }

      const ltData = this._ltCache.get(ltKey);
      ltDataMap.set(ltData.id, ltData);
    });

    if (allFound === false) {
      return false;
    }

    return ltDataMap;
  }

  /**
   * Execute a `map` operation on any `iterator`
   * @param {Iterator} iterator
   * @param {Function} mapper
   * @returns {Array}
   * @private
   */
  _mapIterator(iterator, mapper) {
    const result = [];
    let index = 0;
    let current;
    while (true) { // eslint-disable-line no-constant-condition
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

  /**
   * @param {Map} dataMap
   * @returns {Map}
   * @private
   */
  _filterCompleteEntries(dataMap) {
    const filteredMap = new Map();
    dataMap.forEach((data, subkey) => {
      if (subkey === 'complete') {
        return;
      }

      filteredMap.set(subkey, data);
    });

    return filteredMap;
  }
}

CachingLabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'abortablePromiseFactory',
  'cacheService',
  'loggerService',
  'frameIndexService',
];

export default CachingLabeledThingInFrameGateway;
