import ToolActionStruct from './ToolActionStruct';

class MultiToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Video} video
   * @param {Task} task
   * @param {FramePosition} framePosition
   * @param {string} requirementsThingOrGroupId
   * @param {string} requirementsShape
   */
  constructor(options, viewport, video, task, framePosition, requirementsThingOrGroupId, requirementsShape) {
    super(options, viewport);

    /**
     * @type {Video}
     */
    this.video = video;

    /**
     * @type {Task}
     */
    this.task = task;

    /**
     * @type {FramePosition}
     */
    this.framePosition = framePosition;

    /**
     * @type {string}
     */
    this.requirementsThingOrGroupId = requirementsThingOrGroupId;

    /**
     * @type {string}
     */
    this.requirementsShape = requirementsShape;
  }
}

export default MultiToolActionStruct;
