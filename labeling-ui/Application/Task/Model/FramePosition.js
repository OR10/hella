import ReferenceCountingLock from '../../Common/Support/ReferenceCountingLock';

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
   * @param {angular.$q} $q
   * @param {{lowerLimit: integer, upperLimit: integer}} frameIndexLimits
   * @param {integer} position
   */
  constructor($q, frameIndexLimits, position = frameIndexLimits.lowerLimit) {
    /**
     * @type {ReferenceCountingLock}
     */
    this.lock = new ReferenceCountingLock($q, () => this._onFrameChangeComplete());

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
    this._oneTimeSubscribers = {};

    /**
     * Callbacks that are called if a frame change is complete
     *
     * @type {Object}
     * @private
     */
    this._completeCallbacks = {};
  }

  registerOnFrameChangeOnce(name, callback) {
    this._oneTimeSubscribers[name] = callback;
  }


  _onFrameChangeComplete() {
    Object.keys(this._oneTimeSubscribers).forEach(name => {
      const fn = this._oneTimeSubscribers[name];
      fn(this._position);
    });
    this._oneTimeSubscribers = {};
  }

  /**
   * Retrieve the currently active position
   * @returns {integer}
   */
  get position() {
    return this._position;
  }

  /**
   * Jump to a specific position within this frameIndexLimits.
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
