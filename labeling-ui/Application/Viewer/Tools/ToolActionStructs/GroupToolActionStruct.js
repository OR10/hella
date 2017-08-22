import ToolActionStruct from './ToolActionStruct';

class GroupToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Task} task
   * @param {string} requirementsThingOrGroupId
   * @param {FramePosition} framePosition
   */
  constructor(options, viewport, task, requirementsThingOrGroupId, framePosition) {
    super(options, viewport);

    /**
     * @type {Task}
     */
    this.task = task;

    /**
     * @type {string}
     */
    this.requirementsThingOrGroupId = requirementsThingOrGroupId;

    /**
     * @type {FramePosition}
     */
    this.framePosition = framePosition;
  }
}


export default GroupToolActionStruct;
