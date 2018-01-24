import ToolActionStruct from './ToolActionStruct';

class CreationToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Video} video
   * @param {Task} task
   * @param {FramePosition} framePosition
   * @param {string} requirementsThingOrGroupId
   * @param {Array} taskClasses
   * @param {string} drawLabeledThingGroupsInFrameAs
   */
  constructor(options, viewport, video, task, framePosition, requirementsThingOrGroupId, taskClasses, drawLabeledThingGroupsInFrameAs = 'rectangle') {
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
     * @type {Array}
     */
    this.taskClasses = taskClasses;

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
    this.drawLabeledThingGroupsInFrameAs = drawLabeledThingGroupsInFrameAs;
  }
}

export default CreationToolActionStruct;
