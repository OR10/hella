import {cloneDeep} from 'lodash';
import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThing
 *
 * @extends LabeledObject
 */
class LabeledThing extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, task: Task, frameRange: FrameRange, lineColor: string, projectId: string, groupIds: Array.<string>}} labeledThing
   */
  constructor(labeledThing) {
    super(labeledThing);

    /**
     * {@link FrameRange} this `LabeledThing` is defined in
     *
     * @type {FrameRange}
     */
    this.frameRange = cloneDeep(labeledThing.frameRange);

    /**
     * @type {String}
     * @private
     */
    this._lineColor = labeledThing.lineColor;

    /**
     * @type {Array.<string>}
     */
    this.groupIds = labeledThing.groupIds || [];
  }

  /**
   * @returns {String}
   */
  get lineColor() {
    return this._lineColor;
  }


  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {frameRange, lineColor, groupIds} = this;
    return Object.assign(super.toJSON(), {
      lineColor,
      groupIds,
      frameRange: cloneDeep(frameRange),
    });
  }

  /**
   * @return {LabeledThing}
   */
  clone() {
    return new LabeledThing(this);
  }
}

export default LabeledThing;
