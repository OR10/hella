/**
 * Gateway to interact with {@link FrameLocation}s
 *
 * This gateway is capable of preloading creating and interacting with {@link FrameLocation} models.
 */
class FrameGateway {
  /**
   * @param {angular.$q} $q
   * @param {AbortablePromiseFactory} abortable
   */
  constructor($q, abortable) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortable = abortable;
  }

  /**
   * Create and return an {@link HTMLImageElement} for the given {@link FrameLocation}
   *
   * @param {FrameLocation} location
   * @returns {AbortablePromise.<HTMLImageElement>}
   */
  getImage(location) {
    return this._abortable(this._$q((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.crossOrigin = 'Anonymous';
      image.src = location.url;
    }));
  }
}

FrameGateway.$inject = [
  '$q',
  'abortablePromiseFactory',
];

export default FrameGateway;
