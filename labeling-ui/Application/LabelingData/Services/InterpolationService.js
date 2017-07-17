/**
 * Manager for different interpolation implementations
 */
class InterpolationService {
  /**
   * @param {$q} $q
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {PouchDbSyncManager} pouchDbSyncManager
   * @param {PouchDbContextService} pouchDbContextService
   * @param {Interpolation} interpolationType
   */
  constructor($q, labeledThingGateway, pouchDbSyncManager, pouchDbContextService, interpolationType) {
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
     * @type {Interpolation}
     * @private
     */
    this._interpolation = interpolationType;
  }

  /**
   * Interpolate a specific {@link LabeledThing} between the given `startFrame` and `endFrame` using the provided {@link Interpolation}
   *
   * `frameRange` is optional. It will automatically fallback to the `frameRange` of the
   * {@link LabeledThing} if not provided.
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
        return this._pouchDbSyncManager.startDuplexLiveReplication(pouchDBContext);
      });
  }
}

InterpolationService.$inject = [
  '$q',
  'labeledThingGateway',
  'pouchDbSyncManager',
  'pouchDbContextService',
  'interpolationType',
];

export default InterpolationService;
