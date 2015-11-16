import LabeledObject from './LabeledObject';

/**
 * Model for a LabeledThingInFrame
 *
 * @extends LabeledObject
 */
class LabeledThingInFrame extends LabeledObject {
  /**
   * @param {{id: string, classes: Array.<string>, incomplete: boolean, taskId: string, frameNumber: int, labeledThingId: string, shapes: Array.<Object>}} labeledThingInFrame
   */
  constructor(labeledThingInFrame) {
    super(labeledThingInFrame);

    /**
     * Unique identifier of the {@link Task} associated with this `LabeledFrame`
     *
     * @type {string}
     */
    this.taskId = labeledThingInFrame.taskId;

    /**
     * {@link FrameRange} this `LabeledThing` is defined in
     *
     * @type {int}
     */
    this.frameNumber = labeledThingInFrame.frameNumber;

    /**
     * Unique identifier of associated {@link LabeledThing}
     *
     * @type {string}
     */
    this.labeledThingId = labeledThingInFrame.labeledThingId;

    /**
     * Array of shapes associated with this `LabeledThingInFrame`
     *
     * @type {Array.<Object>}
     */
    this.shapes = labeledThingInFrame.shapes;
  }
}

export default LabeledThingInFrame;
