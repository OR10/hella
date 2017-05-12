import PaperShape from './PaperShape';

class PaperFrame extends PaperShape {
  /**
   * @param {LabeledFrame} labeledFrame
   */
  constructor(labeledFrame) {
    // Constant values are passed to partent constructor since the shape will never be rendered
    super(`frame-shape-for-frame-${labeledFrame.frameIndex}`, {primary: 1, secondary: 1});

    /**
     * @type {LabeledFrame}
     * @private
     */
    this._labeledFrame = labeledFrame;
  }

  /**
   * @return {LabeledFrame}
   */
  get labeledFrame() {
    return this._labeledFrame;
  }

  /**
   * @abstract
   * @method PaperShape#select
   */
  select() {
  }

  /**
   * @abstract
   * @method PaperShape#deselect
   */
  deselect() {
  }

  /**
   * @return {boolean}
   */
  canBeDeleted() {
    return false;
  }

  /**
   * @return {boolean}
   */
  canBeInterpolated() {
    return false;
  }

  /**
   * @return {Object}
   */
  toJSON() {
    return {};
  }
}

/**
 * @return {string}
 */
PaperFrame.getClass = () => {
  return 'frame-shape';
};

export default PaperFrame;
