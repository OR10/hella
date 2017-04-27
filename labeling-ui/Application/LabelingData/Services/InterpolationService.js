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
   * @param {Array.<Interpolation>} interpolation
   */
  constructor($q, labeledThingGateway, cache, cacheHeater, featureFlags, pouchDbSyncManager, pouchDbContextService, interpolation) {
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
     *
     * @type {Array.<Interpolation>}
     * @private
     */
    this._interpolation = interpolation;
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
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   * @return {Promise.<*>}
   */
  interpolate(task, labeledThing, frameRange = null) {
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
          return this._interpolation.execute(task, labeledThing, interpolationFrameRange);
        })
        .then(() => {
          return this._pouchDbSyncManager.pullUpdatesForContext(pouchDBContext);
        })
        .then(() => {
          this._cacheHeater.heatFrames(task, interpolationFrameRange.startFrameIndex, interpolationFrameRange.endFrameIndex);
          return this._pouchDbSyncManager.startDuplexLiveReplication(pouchDBContext);
        });
    }
    return this._interpolation
      .execute(task, labeledThing, interpolationFrameRange)
      .then(result => {
        this._cacheHeater.heatFrames(task, interpolationFrameRange.startFrameIndex, interpolationFrameRange.endFrameIndex);
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
}

InterpolationService.$inject = [
  '$q',
  'labeledThingGateway',
  'cacheService',
  'cacheHeaterService',
  'featureFlags',
  'pouchDbSyncManager',
  'pouchDbContextService',
  // You can choose between frontend or backend interpolation by changing this service
  'frontendInterpolation',
];

export default InterpolationService;
