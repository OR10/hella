/**
 * A specific frame position inside a range of frames
 *
 * @implements FrameRange
 */
class FramePosition {
  /**
   * Create a new FramePosition object
   *
   * If no `position` is specified `lowerLimit` from the `frameIndexLimits` will be used.
   *
   * @param {LockService} lockService
   * @param {{lowerLimit: integer, upperLimit: integer}} frameIndexLimits
   * @param {integer} position
   */
  constructor(lockService, frameIndexLimits, position = frameIndexLimits.lowerLimit) {
    /**
     * @type {LockService}
     * @private
     */
    this._lockService = lockService;

    /**
     * @type {integer}
     * @private
     */
    this._lowerLimit = frameIndexLimits.lowerLimit;

    /**
     * @type {integer}
     * @private
     */
    this._upperLimit = frameIndexLimits.upperLimit;

    /**
     * Current Frame position, within the FrameRange
     *
     * @type {integer}
     * @private
     */
    this._position = position;

    /**
     * Frame change subscribers
     *
     * @type {Object}
     * @private
     */
    this._subscribers = {
      before: {
        always: {},
      },
      after: {
        oneTime: {},
        always: {},
      },
    };

    /**
     * Subscriber locks
     *
     * @type {Array<string>}
     */
    this.locks = [];

    /**
     * Callbacks that are called if a frame change is complete
     *
     * @type {Object}
     * @private
     */
    this.completeCallbacks = {};

    this.lock = this._lockService.createRefCountLock(
      () => this._onFrameChangeBefore(),
      () => this._onFrameChangeAfter()
    );
  }

  /**
   * Subscribe always to a before frame change event
   *
   * @param {String} name
   * @param {Function} callback
   */
  beforeFrameChangeAlways(name, callback) {
    this._subscribers.before.always[name] = callback;
  }

  /**
   * Subscribe once to a after frame change event
   *
   * @param {String} name
   * @param {Function} callback
   */
  afterFrameChangeOnce(name, callback) {
    this._subscribers.after.oneTime[name] = callback;
  }

  /**
   * Subscribe to every after frame change event
   *
   * @param {String} name
   * @param {Function} callback
   */
  afterFrameChangeAlways(name, callback) {
    this._subscribers.after.always[name] = callback;
  }

  /**
   * Handle the subscribers for the before frame change event
   *
   * @private
   */
  _onFrameChangeBefore() {
    // Trigger all reapeated subscribers
    Object.keys(this._subscribers.before.always).forEach(name => {
      this._subscribers.before.always[name](this._position);
    });
  }

  /**
   * Handle the subscribers for the after frame change event
   *
   * @private
   */
  _onFrameChangeAfter() {
    // Trigger all one time subscribers and clear the list afterwards
    Object.keys(this._subscribers.after.oneTime).forEach(name => {
      this._subscribers.after.oneTime[name](this._position);
    });
    this._subscribers.after.oneTime = {};

    // Trigger all reapeated subscribers
    Object.keys(this._subscribers.after.always).forEach(name => {
      this._subscribers.after.always[name](this._position);
    });
  }

  /**
   * Retrieve the currently active frame index
   *
   * @returns {integer}
   */
  get position() {
    return this._position;
  }

  /**
   * Jump to a specific position within this FrameRange.
   *
   * @param {integer} newPosition
   */
  goto(newPosition) {
    if (newPosition < this._lowerLimit) {
      this._position = this._lowerLimit;
    } else if (newPosition > this._upperLimit) {
      this._position = this._upperLimit;
    } else {
      this._position = newPosition;
    }
  }

  /**
   * Jump by given amount of frame indices.
   *
   * Negative values correlate to a backwards jump
   *
   * @param {number} amount
   */
  jumpBy(amount) {
    this.goto(this._position + amount);
  }

  /**
   * Jump to the next position inside the current frameIndexLimits
   *
   * If the next position is outside of the current frameIndexLimits `false` is returned and the jump is aborted
   *
   * On successful change to the next position `true` is returned.
   *
   * @returns {boolean}
   */
  next() {
    try {
      this.jumpBy(+1);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Jump to the previous position inside the current frameIndexLimits
   *
   * If the previous position is outside of the current frameIndexLimits `false` is returned and the jump is aborted
   *
   * On successful change to the previous position `true` is returned.
   *
   * @returns {boolean}
   */
  previous() {
    try {
      this.jumpBy(-1);
    } catch (error) {
      return false;
    }

    return true;
  }
}

export default FramePosition;
