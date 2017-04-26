import LabeledFrame from '../Models/LabeledFrame';

/**
 * Gateway for saving and retrieving {@link LabeledFrame}s from pouchdb
 */
class PouchDbLabeledFrameGateway {
  constructor() {
  }

  /**
   * Returns the {@link LabeledFrame} for the given `taskId` and `frameIndex`
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  getLabeledFrame(taskId, frameIndex) {
  }


  /**
   * Updates the labeled frame for the given task and frame number in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   * @param {LabeledFrame} labeledFrame
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  saveLabeledFrame(taskId, frameIndex, labeledFrame) {
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<Boolean|Error>}
   */
  deleteLabeledFrame(taskId, frameIndex) {
  }
}

PouchDbLabeledFrameGateway.$inject = [
];

export default PouchDbLabeledFrameGateway;
