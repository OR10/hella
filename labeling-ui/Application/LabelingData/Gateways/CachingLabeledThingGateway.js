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
   */
  constructor(apiService, revisionManager, bufferedHttp, cache, $q, abortable) {
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
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise.<LabeledThing|Error>}
   */
  saveLabeledThing(labeledThing) {
    const {task} = labeledThing;
    this._ltCache.invalidate(`${task.id}.${labeledThing.id}`);

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
];

export default CachingLabeledThingGateway;
