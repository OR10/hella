/**
 * Interface every implemented `Interpolation` needs to implement in order to interact with the {@link InterpolationService}
 * @interface Interpolation
 */

/**
 * Execute the Interpolation
 *
 * The return value is a promise, which will be fired, after the interpolation is complete.
 * A completed interpolation implies, that every frame inside the specified frame range has been
 * updated with a corresponding {@link LabeledThingInFrame} containing the interpolated position.
 * The data can be assumed to already have been stored to the backend.
 *
 * @name Interpolation#execute
 *
 * @param {string} taskId
 * @param {string} labeledThingId
 * @param {FrameRange} frameRange
 * @return {Promise.<*>}
 */
