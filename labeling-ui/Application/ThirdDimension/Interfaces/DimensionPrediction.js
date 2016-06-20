/**
 * Interface any DimensionPrediction has to implement
 *
 * @interface DimensionPrediction
 */

/**
 * Check whether a certain prediction type is supported by the model implementation
 *
 * If a prediction acknowledges support it needs to be capable of handling the corresponding `prediction` object of this
 * type for construction.
 *
 * @name DimensionPrediction#supportsType
 * @static
 * @param {string} type
 * @returns {boolean}
 */
