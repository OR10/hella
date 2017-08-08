import Cuboid from '../Models/DimensionPrediction/Cuboid';

/**
 * Gateway to interact with DimensionPredictions
 */
class DimensionPredictionGateway {
  /**
   * @param {angular.$q} $q
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp injected
   */
  constructor($q, apiService, bufferedHttp) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;

    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;
  }

  /**
   * Retrieve a dimension prediction for a certain {@link LabeledThing} and a given `frameIndex`
   *
   * Predictions need to be as fast as possible. Therefore they have their own request queue.
   * It is completely acceptable for a prediction to be inaccurate due to timing constraints or still waiting storage
   * requests. However it is supposed be fast.
   *
   * @param {LabeledThing} labeledThing
   * @param {Number} frameIndex
   *
   * @returns {AbortablePromise.<DimensionPrediction>}
   */
  predictDimensionsFor(labeledThing, frameIndex) {
    const {id: labeledThingId} = labeledThing;
    return this._bufferedHttp({
      method: 'GET',
      url: this._apiService.getApiUrl(
        `/dimensionPrediction/${labeledThingId}/${frameIndex}`
      ),
    }, 'dimensionPrediction')
      .then(response => {
        if (
          response === null ||
          response.data === undefined ||
          response.data.result === undefined ||
          typeof response.data.result !== 'object'
        ) {
          throw new Error(`Invalid dimension prediction received: ${response}`);
        }

        const {result} = response.data;

        return this._createDimensionPredictionForType(result.type, result.prediction);
      });
  }

  /**
   * Check all available predictions for one, that supports the given type and create it afterwards
   *
   * @param {string} type
   * @param {Object} prediction
   * @private
   */
  _createDimensionPredictionForType(type, prediction) {
    let PredictionModel = null;
    [Cuboid]
      .forEach(
        PossiblePrediction => PossiblePrediction.supportsType(type) && (PredictionModel = PossiblePrediction)
      );

    if (PredictionModel === null) {
      return this._$q.reject(new Error(`Unknown dimensionPrediction#type: ${type}`));
    }

    return new PredictionModel(prediction);
  }

}

DimensionPredictionGateway.$inject = [
  '$q',
  'ApiService',
  'bufferedHttp',
];

export default DimensionPredictionGateway;
