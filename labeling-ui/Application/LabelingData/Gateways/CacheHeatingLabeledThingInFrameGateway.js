import CachingLabeledThingInFrameGateway from './CachingLabeledThingInFrameGateway';

/**
 * Gateway for heating up the cache again after invalidations
 */
class CacheHeatingLabeledThingInFrameGateway extends CachingLabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {$q} $q
   * @param {AbortablePromiseFactory} abortable
   * @param {CacheService} cache
   * @param {LoggerService} logger
   * @param {FrameIndexService} frameIndexService
   * @param {CacheHeaterService} cacheHeater
   */
  constructor(apiService, bufferedHttp, $q, abortable, cache, logger, frameIndexService, cacheHeater) {
    super(apiService, bufferedHttp, $q, abortable, cache, logger, frameIndexService);

    /**
     * @type {CacheHeaterService}
     * @private
     */
    this._cacheHeater = cacheHeater;
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    return super.saveLabeledThingInFrame(labeledThingInFrame)
      .then((newLabeledThingInFrame) => {
        this._cacheHeater.heatLabeledThingInFrame(newLabeledThingInFrame);
        return newLabeledThingInFrame;
      });
  }
}

CacheHeatingLabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  'abortablePromiseFactory',
  'cacheService',
  'loggerService',
  'frameIndexService',
  'cacheHeaterService',
];

export default CacheHeatingLabeledThingInFrameGateway;
