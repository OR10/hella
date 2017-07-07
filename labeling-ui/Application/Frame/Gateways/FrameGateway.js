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

  /**
   * Initiate a preloading of the given list of locations
   *
   * The corresponding images will be loaded and stored inside the cache for faster retrieval afterwards
   *
   * The returned promise is resolved once all images have been loaded and cached. The resolve value is an array of loaded
   * images. Images which had already been stored in the cache before hand are not part of this array. Therefore the
   * returned images do not strictly correlate to the given url list!
   *
   * @param {Array.<FrameLocation>} locations
   * @return {Promise.<Array.<HTMLImageElement>>}
   */
  preloadImages(locations) {
    // Only images not in the cache are requested
    const urls = locations.map(location => location.url);
    const nonCachedUrls = urls.filter(url => !this._imageCache.hasImageForUrl(url));

    return this._$q.resolve()
      .then(() => this._imageFetcher.fetchMultiple(nonCachedUrls))
      .then(images => this._imageCache.addImages(images));
  }
}

FrameGateway.$inject = [
  '$q',
  'abortablePromiseFactory',
  'imageFetcher',
  'imageCache',
];

export default FrameGateway;
