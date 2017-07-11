import URI from 'urijs';

/**
 * Storage of Image Objects based on their url
 *
 * Warning: Image objects residing inside the Cache will not be freed by GC
 */
class ImageCache {
  constructor() {
    /**
     * @type {Map<string, Image>}
     * @private
     */
    this._cache = new Map();
  }

  /**
   * Empty the cache and let GC free all Images
   */
  clear() {
    this._cache.clear();
  }

  /**
   * @param {Image} image
   * @returns {Image}
   */
  addImage(image) {
    const normalizedUrl = this._normalizeUrl(image.src);
    this._cache.set(normalizedUrl, image);
    return image;
  }

  /**
   * @param {Array.<Image>} images
   * @return {Array.<Image>}
   */
  addImages(images) {
    return images.map(image => this.addImage(image));
  }

  /**
   * @param {string} url
   * @returns {boolean}
   */
  hasImageForUrl(url) {
    const normalizedUrl = this._normalizeUrl(url);
    return this._cache.has(normalizedUrl);
  }

  /**
   * Return the cached image for the given url.
   *
   * Throws an exception if the image ist not cached for the given url.
   *
   * @param {string} url
   * @returns {Image}
   */
  getImageForUrl(url) {
    const normalizedUrl = this._normalizeUrl(url);

    if (!this._cache.has(normalizedUrl)) {
      throw new Error(`Could not find Image for url ${normalizedUrl} in cache.`);
    }

    return this._cache.get(normalizedUrl);
  }

  /**
   * @param {string} url
   * @return {string}
   * @private
   */
  _normalizeUrl(url) {
    const uri = new URI(url);
    uri.normalize();
    return uri.toString();
  }
}

ImageCache.$inject = [
];

export default ImageCache;
