import ToolActionStruct from './ToolActionStruct';

class MultiToolActionStruct extends ToolActionStruct {
  /**
   * @param {Object} options
   * @param {Viewport} viewport
   * @param {Object} delegatedOptions
   * @param {boolean} readOnly
   * @param {Video} video
   * @param {Task} task
   * @param {FramePosition} framePosition
   * @param {string} requirementsThingOrGroupId
   * @param {string} requirementsShape
   * @param {PaperShape|null} selectedPaperShape
   * @param {Array} taskClasses
   * @param {string} drawLabeledThingGroupsInFrameAs
   */
  constructor(options, viewport, delegatedOptions, readOnly, video, task, framePosition, requirementsThingOrGroupId, requirementsShape, selectedPaperShape, taskClasses, drawLabeledThingGroupsInFrameAs = 'rectangle') {
    super(options, viewport);

    /**
     * @type {Object}
     */
    this.delegatedOptions = delegatedOptions;

    /**
     * @type {boolean}
     */
    this.readOnly = readOnly;

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

    /**
     * @type {PaperShape|null}
     */
    this.selectedPaperShape = selectedPaperShape;

    /**
     * @type {string}
     */
    this.drawLabeledThingGroupsInFrameAs = drawLabeledThingGroupsInFrameAs;

    /**
     * @type {Array}
     */
    this.taskClasses = taskClasses;
  }
}

export default MultiToolActionStruct;
