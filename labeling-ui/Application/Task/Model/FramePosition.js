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
   * If no `position` is specified `startFrameNumber` will be used.
   *
   * @param {FrameRange} frameRange
   * @param {int} position
   */
  constructor($q, {startFrameNumber, endFrameNumber}, position = startFrameNumber) {
    /**
     * @inheritDoc
     */
    this.startFrameNumber = startFrameNumber;

    /**
     * @inheritDoc
     */
    this.endFrameNumber = endFrameNumber;

    /**
     * Current Frame position, within the FrameRange
     *
     * @type {int}
     * @private
     */
    this._position = position;

    /**
     * Frame change subscribers
     *
     * @type {Object}
     */
    this._subscribers = {
      before: {
        always: {}
      },
      after: {
        oneTime: {},
        always: {}
      }
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
     */
    this.completeCallbacks = {};

    this.lock = new ReferenceCountingLock(
      $q,
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
    Object.keys(this._subscribers.before.always).forEach((name) => {
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
    Object.keys(this._subscribers.after.oneTime).forEach((name) => {
      this._subscribers.after.oneTime[name](this._position);
    });
    this._subscribers.after.oneTime = {};

    // Trigger all reapeated subscribers
    Object.keys(this._subscribers.after.always).forEach((name) => {
      this._subscribers.after.always[name](this._position);
    });
  }

  /**
   * Retrieve the currently active position
   *
   * @returns {int}
   */
  get position() {
    return this._position;
  }

  /**
   * Jump to a specific position within this FrameRange.
   *
   * @param {int} newPosition
   */
  goto(newPosition) {
    if (newPosition < this.startFrameNumber) {
      this._position = this.startFrameNumber;
    } else if (newPosition > this.endFrameNumber) {
      this._position = this.endFrameNumber;
    } else {
      this._position = newPosition;
    }
  }

  /**
   * Jump to the next position inside the current framerange
   *
   * If the next position is outside of the current framerange `false` is returned and the jump is aborted
   *
   * On successful change to the next position `true` is returned.
   *
   * @returns {boolean}
   */
  next() {
    try {
      this.goto(this._position + 1);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Jump to the previous position inside the current framerange
   *
   * If the previous position is outside of the current framerange `false` is returned and the jump is aborted
   *
   * On successful change to the previous position `true` is returned.
   *
   * @returns {boolean}
   */
  previous() {
    try {
      this.goto(this._position - 1);
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Jump by a give amount in forwards position (positive amount)
   * or in backwards postition (negative amount)
   *
   * @param amount
   */
  jumpBy(amount) {
    this.goto(this.position + amount);
  }
}

export default FramePosition;
