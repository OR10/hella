import LabeledThing from '../Models/LabeledThing';

import CachingLabeledThingGateway from './CachingLabeledThingGateway';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s
 */
class CacheHeatingLabeledThingGateway extends CachingLabeledThingGateway {
  /**
   * @param {ApiService} apiService
   * @param {RevisionManager} revisionManager
   * @param {BufferedHttp} bufferedHttp
   * @param {CacheService} cache
   * @param {angular.$q} $q
   * @param {AbortablePromiseFactory} abortable
   * @param {CacheHeaterService} cacheHeater
   */
  constructor(apiService, revisionManager, bufferedHttp, cache, $q, abortable, cacheHeater) {
    super(apiService, revisionManager, bufferedHttp, cache, $q, abortable);

    /**
     * @type {CacheHeaterService}
     * @private
     */
    this._cacheHeater = cacheHeater;
  }

  /**
   * Delete a {@link LabeledThing} and all its descending {@link LabeledThingInFrame} objects
   *
   * @param {LabeledThing} labeledThing
   * @returns {AbortablePromise}
   */
  deleteLabeledThing(labeledThing) {
    this._cacheHeater.stopHeatingLabeledThing(labeledThing);
    return super.deleteLabeledThing(labeledThing);
  }
}

CachingLabeledThingGateway.$inject = [
  'ApiService',
  'revisionManager',
  'bufferedHttp',
  'cacheService',
  '$q',
  'abortablePromiseFactory',
  'cacheHeaterService',
];

export default CacheHeatingLabeledThingGateway;
