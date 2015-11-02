/**
 * One specific LabelingData object
 *
 * @interface LabeledThingInFrame
 */

/**
 * Unique id identifying this specific labeled thing in frame
 *
 * @interface LabeledThingInFrame
 * @property {string} id
 */

/**
 * Unique string that represents the revision of the current object
 *
 * @interface LabeledThingInFrame
 * @property {string} rev
 */

/**
 * The frame this entity belongs to
 *
 * @interface LabeledThingInFrame
 * @property {int} frameNumber
 */

/**
 * A reference to the LabeledThing this entity belongs to
 *
 * @interface LabeledThingInFrame
 * @property {String} labeledThingId
 */

/**
 * Array of shapes the labeled thing in frame can consist of.
 *
 * Different shapes exist, like rectangle, circle etc.
 *
 * @interface LabeledThingInFrame
 * @property {Shape[]} shapes
 */

/**
 * Array of annotated labeling properties for this LabeledThingInFrame.
 *
 * @interface LabeledThingInFrame
 * @property {Object[]} classes
 */
