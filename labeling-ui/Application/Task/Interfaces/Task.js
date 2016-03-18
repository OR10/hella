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

/**
 * User assigned to this Task
 *
 * @name Task#assignedUser
 * @type {integer}
 */

/**
 * Minimal visible shape overflow value
 *
 * A value of `null` means, that there no overflow should be allowed at all.
 * Therefore the `minimalVisibleShapeOverflow` is the size of the shape!
 *
 * @name Task#minimalVisibleShapeOverflow
 * @type {integer|null}
 */

/**
 * Default drawingTool to be used
 *
 * @name Task#drawingTool
 * @type {string}
 */

/**
 * Options to be used for specific DrawingTools
 *
 * @name Task#drawingToolOptions
 * @type {Object.<string, Object>}
 */
