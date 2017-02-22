import ToolActionStruct from './ToolActionStruct';

class CreationToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Video} video
   * @param {Task} task
   * @param {FramePosition} framePosition
   * @param {string} requirementsThingOrGroupId
   */
  constructor(options, viewport, video, task, framePosition, requirementsThingOrGroupId) {
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
  }
}

export default CreationToolActionStruct;
