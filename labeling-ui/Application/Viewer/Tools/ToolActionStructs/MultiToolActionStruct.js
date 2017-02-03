import ToolActionStruct from './ToolActionStruct';

class MultiToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Object} delegatedOptions
   * @param {Video} video
   * @param {Task} task
   * @param {FramePosition} framePosition
   * @param {string} requirementsThingOrGroupId
   * @param {string} requirementsShape
   */
  constructor(options, viewport, delegatedOptions, video, task, framePosition, requirementsThingOrGroupId, requirementsShape) {
    super(options, viewport);

    /**
     * @type {Object}
     */
    this.delegatedOptions = delegatedOptions;

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
