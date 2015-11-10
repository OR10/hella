/**
 * One specific labeled frame
 *
 * @interface LabeledFrame
 */

/**
 * Unique id identifying this specific labeled frame
 *
 * @name LabeledFrame#id
 * @type {string}
 */

/**
 * Unique id identifying the task this entity belongs to
 *
 * @name LabeledFrame#taskId
 * @property {string}
 */

/**
 * Frame number of this labeled frame in the video of its associated task
 *
 * @name LabeledFrame#frameNumber
 * @type {int}
 */

/**
 * Unique string that represents the revision of the current labeled frame
 *
 * @name LabeledFrame#rev
 * @type {string}
 */

/**
 * Array of labels for this LabeledFrame.
 *
 * @name LabeledFrame#classes
 * @type {Array.<string>}
 */
