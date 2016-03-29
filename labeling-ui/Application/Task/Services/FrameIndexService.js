/**
 * Service to transform between `frameIndex` and `frameNumber` values.
 */
class FrameIndexService {
  constructor() {
    /**
     * @type {Map|null}
     * @private
     */
    this._frameIndexToFrameNumber = null;

    /**
     * @type {Map|null}
     * @private
     */
    this._frameNumberToFrameIndex = null;

    /**
     * @type {Task|null}
     * @private
     */
    this._task = null;
  }

  /**
   * @param {Task} task
   */
  setTask(task) {
    this._task = task;
    this._initializeMapping(task.frameNumberMapping);
  }

  /**
   * @param {integer} frameIndex
   * @returns {integer|undefined}
   */
  getFrameNumber(frameIndex) {
    this._ensureTaskIsSet();
    return this._frameIndexToFrameNumber.get(frameIndex);
  }

  /**
   * @param {integer} frameNumber
   * @returns {integer|undefined}
   */
  getFrameIndex(frameNumber) {
    this._ensureTaskIsSet();
    return this._frameNumberToFrameIndex.get(frameNumber);
  }

  /**
   * @param {integer} frameNumber
   * @returns {integer|undefined}
   */
  getNearestFrameIndex(frameNumber) {
    this._ensureTaskIsSet();
    const matchingFrameIndex = this._frameNumberToFrameIndex.get(frameNumber);
    if (matchingFrameIndex !== undefined) {
      return matchingFrameIndex;
    }

    const frameNumberBefore = this._searchForFrameNumber(frameNumber, -1);
    const frameNumberAfter = this._searchForFrameNumber(frameNumber, +1);

    if (frameNumberAfter === undefined) {
      return this._frameNumberToFrameIndex.get(frameNumberBefore);
    } else if (frameNumberBefore === undefined) {
      return this._frameNumberToFrameIndex.get(frameNumberAfter);
    } else if (Math.abs(frameNumber - frameNumberBefore) < Math.abs(frameNumber - frameNumberAfter)) {
      return this._frameNumberToFrameIndex.get(frameNumberBefore);
    }

    return this._frameNumberToFrameIndex.get(frameNumberAfter);
  }

  /**
   * @returns {{lowerLimit: number, upperLimit: number}}
   */
  getFrameNumberLimits() {
    return {
      lowerLimit: Math.min(...this._task.frameNumberMapping),
      upperLimit: Math.max(...this._task.frameNumberMapping),
    };
  }

  /**
   * @returns {{lowerLimit: number, upperLimit: number}}
   */
  getFrameIndexLimits() {
    return {
      lowerLimit: 0,
      upperLimit: this._task.frameNumberMapping.length - 1,
    };
  }

  /**
   * @private
   */
  _ensureTaskIsSet() {
    if (this._task === null) {
      throw new Error('The Task needs to be set before calling any frameIndex <=> frameNumber conversion. This should automatically be done inside the TaskController.');
    }
  }

  /**
   * @param {Array.<integer>} frameNumberMapping
   * @private
   */
  _initializeMapping(frameNumberMapping) {
    this._frameIndexToFrameNumber = new Map();
    this._frameNumberToFrameIndex = new Map();
    frameNumberMapping.forEach((frameNumber, frameIndex) => {
      this._frameNumberToFrameIndex.set(frameNumber, frameIndex);
      this._frameIndexToFrameNumber.set(frameIndex, frameNumber);
    });
  }

  /**
   * Search for a valid and mapped frameNumber starting at `startFrameNumber` using the
   * given `step` value while searching
   *
   * @param {integer} startFrameNumber
   * @param {number} step
   * @private
   */
  _searchForFrameNumber(startFrameNumber, step) {
    const frameNumberLimits = this.getFrameNumberLimits();

    for (
      let frameNumber = startFrameNumber;
      frameNumber >= frameNumberLimits.lowerLimit && frameNumber <= frameNumberLimits.upperLimit;
      frameNumber += step
    ) {
      if (this._frameNumberToFrameIndex.has(frameNumber)) {
        return this._frameNumberToFrameIndex.get(frameNumber);
      }
    }

    return undefined;
  }

}

export default FrameIndexService;
