/**
 * Manager for different interpolation implementations
 */
class InterpolationService {
  /**
   * @param {$q} $q
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {Array.<Interpolation>} interpolations
   */
  constructor($q, labeledThingGateway, ...interpolations) {
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

    return interpolation.execute(task, labeledThing, interpolationFrameRange);
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
  // All Interpolations listed here will be auto registered.
  'linearBackendInterpolation',
];

export default InterpolationService;
