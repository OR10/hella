/**
 * Gateway to interact with {@link FrameLocation}s
 *
 * This gateway is capable of preloading creating and interacting with {@link FrameLocation} models.
 */
class FrameGateway {
  /**
   * @param {angular.$q} $q
   * @param {AbortablePromiseFactory} abortable
   * @param {ImageFetcher} imageFetcher
   * @param {ImageCache} imageCache
   */
  constructor($q, abortable, imageFetcher, imageCache) {
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

    /**
     * @type {ImageFetcher}
     * @private
     */
    this._imageFetcher = imageFetcher;

    /**
     * @type {ImageCache}
     * @private
     */
    this._imageCache = imageCache;
  }

  /**
   * Create and return an {@link HTMLImageElement} for the given {@link FrameLocation}
   *
   * @param {FrameLocation} location
   * @returns {AbortablePromise.<HTMLImageElement>}
   */
  getImage(location) {
    if (this._imageCache.hasImageForUrl(location.url)) {
      return this._abortable(
        this._$q.resolve(
          this._imageCache.getImageForUrl(location.url)
        )
      );
    }

    return this._abortable(
      this._imageFetcher.fetch(location.url)
        .then(image => this._imageCache.addImage(image))
    );
  }
}

FrameGateway.$inject = [
  '$q',
  'abortablePromiseFactory',
  'imageFetcher',
  'imageCache',
];

export default FrameGateway;
