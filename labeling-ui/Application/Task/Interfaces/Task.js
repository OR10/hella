/**
 * Primary Task interface
 *
 * A Task can be considered to be a labeling job. It contains all the needed information to have any user work on it.
 *
 * @interface Task
 */

/**
 * Unique identification of this Task
 *
 * @name Task#id
 * @type {string}
 */

/**
 * Referenced Video to be used within this Task
 * @name Task#videoId
 * @type {string}
 */

/**
 * {@link FrameRange} to be taken from the Video for this specific task.
 *
 * @name Task#frameRange
 * @type {FrameRange}
 */

/**
 * List of available ImageTypes
 *
 * @name Task#requiredImageTypes
 * @type {Array.<string>}
 */

