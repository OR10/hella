/**
 * Manager for different interpolation implementations
 */
class InterpolationService {
  /**
   * @param {$q} $q
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {CacheService} cache
   * @param {CacheHeaterService} cacheHeater
   * @param {Object} featureFlags
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {Array.<Interpolation>} interpolations
   */
  constructor($q, labeledThingGateway, cache, cacheHeater, featureFlags, pouchDbSyncManager, pouchDbContextService, ...interpolations) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

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
     * @type {CacheHeaterService}
     * @private
     */
    this._cacheHeater = cacheHeater;

    this.featureFlags = featureFlags;
    /**
     * @type {PouchDbSyncManager}
     * @private
     */
    this._pouchDbSyncManager = pouchDbSyncManager;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * All registered Interpolations
     *
     * @type {Map.<string, Interpolation>}
     * @private
     */
    this._interpolations = new Map();
    interpolations.forEach(interpolation => this._interpolations.set(interpolation.id, interpolation));
    if (interpolations.length > 0) {
      this.setDefaultInterpolation(interpolations[0].id);
    }
  }

  /**
   * Interpolate a specific {@link LabeledThing} between the given `startFrame` and `endFrame` using the provided {@link Interpolation}
   *
   * `frameRange` is optional. It will automatically fallback to the `frameRange` of the
   * {@link LabeledThing} if not provided.
   *
   * A special `id` of `default` is available, which will fallback to the default interpolation set.
   *
   * The return value is a promise, which will be fired, after the interpolation is complete.
   * A completed interpolation implies, that every frame inside the specified frame range has been
   * updated with a corresponding {@link LabeledThingInFrame} containing the interpolated position.
   * The data can be assumed to already have been stored to the backend.
   *
   * Regarding the chosen {@link Interpolation} the operation may take some time.
   *
   * @param {string} id
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   * @return {Promise.<*>}
   */
  interpolate(id, task, labeledThing, frameRange = null) {
    if (!this._interpolations.has(id)) {
      throw new Error(`Interpolation with id '${id}' is not currently registered on the InterpolationService.`);
    }
    const interpolation = this._interpolations.get(id);
    let interpolationFrameRange = frameRange;
    if (!frameRange) {
      interpolationFrameRange = labeledThing.frameRange;
    }

    this._invalidateCaches(labeledThing, interpolationFrameRange.startFrameIndex, interpolationFrameRange.endFrameIndex);

    if (this.featureFlags.pouchdb === true) {
      const pouchDBContext = this._pouchDbContextService.provideContextForTaskId(task.id);
      return this._pouchDbSyncManager.stopReplicationsForContext(pouchDBContext)
        .then(() => {
          return this._pouchDbSyncManager.pushUpdatesForContext(pouchDBContext);
        })
        .then(() => {
          return interpolation.execute(task, labeledThing, interpolationFrameRange);
        })
        .then(() => {
          return this._pouchDbSyncManager.pullUpdatesForContext(pouchDBContext);
        })
        .then(() => {
          this._cacheHeater.heatFrames(task, interpolationFrameRange.startFrameIndex, interpolation.endFrameIndex);
          return this._pouchDbSyncManager.startDuplexLiveReplication(pouchDBContext);
        });
    }
    return interpolation
      .execute(task, labeledThing, interpolationFrameRange)
      .then(result => {
        this._cacheHeater.heatFrames(task, interpolationFrameRange.startFrameIndex, interpolation.endFrameIndex);
        return result;
      });
  }

  /**
   * Invalidate every cached ltif associated with a certain lt within the given frame range
   *
   * @param {LabeledThing} labeledThing
   * @param {number} start
   * @param {number} end
   * @private
   */
  _invalidateCaches(labeledThing, start, end) {
    const {task} = labeledThing;
    for (let frameIndex = start; frameIndex <= end; frameIndex++) {
      // Invalidate ghosts
      this._ltifGhostCache.invalidate(`${task.id}.${frameIndex}.${labeledThing.id}`);

      // Invalidate non-ghosts
      const ltifFrameMap = this._ltifCache.get(`${task.id}.${frameIndex}`);

      // Invalidate all complete pages within the interpolation range
      this._ltifCache.invalidate(`${task.id}.${frameIndex}.complete`);

      if (ltifFrameMap !== undefined) {
        ltifFrameMap.forEach(ltifData => { // eslint-disable-line no-loop-func
          if (ltifData.labeledThingId !== labeledThing.id) {
            return;
          }

          this._ltifCache.invalidate(`${task.id}.${frameIndex}.${ltifData.id}`);
        });
      }
    }
  }

  /**
   * Set a default interpolation, gets the special 'default' id
   *
   * @param {string} id
   * @returns {Interpolation}
   */
  setDefaultInterpolation(id) {
    if (!this._interpolations.has(id)) {
      throw new Error(`Interpolation with id '${id}' is not currently registered on the InterpolationService.`);
    }

    const defaultInterpolation = this._interpolations.get(id);
    this._interpolations.set('default', defaultInterpolation);

    return defaultInterpolation;
  }
}

InterpolationService.$inject = [
  '$q',
  'labeledThingGateway',
  'cacheService',
  'cacheHeaterService',
  'featureFlags',
  'pouchDbSyncManager',
  'pouchDbContextService',
  // All Interpolations listed here will be auto registered.
  'linearFrontendInterpolation',
];

export default InterpolationService;
