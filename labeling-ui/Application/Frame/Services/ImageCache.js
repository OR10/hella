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
   */
  addImages(images) {
    images.forEach(image => this.addImage(image));
  }

  hasImageForUrl(url) {
    const normalizedUrl = this._normalizeUrl(url);
    return this._cache.has(normalizedUrl);
  }

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