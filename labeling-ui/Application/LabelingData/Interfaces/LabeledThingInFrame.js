/**
 * One specific LabelingData object
 *
 * @interface LabeledThingInFrame
 */

/**
 * Unique id identifying this specific labeled thing in frame
 *
 * @property {string} id
 */

/**
 * Unique string that represents the revision of the current object
 *
 * @property {string} rev
 */

/**
 * The frame this entity belongs to
 *
 * @property {int} frameNumber
 */

/**
 * A reference to the LabeledThing this entity belongs to
 *
 * @property {String} labeledThingId
 */

/**
 * Array of shapes the labeled thing in frame can consist of.
 *
 * Different shapes exist, like rectangle, circle etc.
 *
 * @property {Shape[]} shapes
 */

/**
 * Array of annotated labeling properties for this LabeledThingInFrame.
 *
 * @property {Object[]} classes
 */
