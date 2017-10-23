import PaperShape from './PaperShape';

/**
 * Type of shape, that is not persisted inside the database.
 */
class PaperVirtualShape extends PaperShape {
  constructor(shapeId, color) {
    super(shapeId, color);

    /**
     * @type {undefined}
     * @private
     */
    this._virtualLabeledThingInFrame = undefined;
  }

  /**
   * @return {boolean}
   */
  canBeInterpolated() {
    return false;
  }

  /**
   * @return {boolean}
   */
  canBeSliced() {
    return false;
  }

  /**
   * @return {boolean}
   */
  canBeJumpedToStartEndFrame() {
    return false;
  }

  /**
   * @return {boolean}
   */
  canChangeFrameRange() {
    return false;
  }

  get virtualLabeledThingInFrame() {
    if (this._virtualLabeledThingInFrame === undefined) {
      throw new Error('VirtualLabeledThingInFrame needs to be set in child constructor. It is abstract!');
    }

    return this._virtualLabeledThingInFrame;
  }
}

export default PaperVirtualShape;
