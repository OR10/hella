/**
 * This service provides the means to create and access Html Image elements.
 *
 * The creation of `Image`-Instances is quite expensive, therefore this pool manages the instances once, they are
 * created and allows to reuse already allocated instances. Furthermore preallocation is possible as well.
 */
class ImagePool {
  constructor(options) {
    /**
     * Options for this image pool
     * @type {{maximumPoolSize: number|Infinity, preallocationSize: number}}
     * @private
     */
    this._options = Object.assign({}, ImagePool.DEFAULT_OPTIONS, options);

    /**
     * Currently available Image instances for usage
     *
     * @type {Set.<Image>}
     * @private
     */
    this._pool = new Set();

    /**
     * Currently allocated Image instances, which are in use
     *
     * @type {Set.<Image>}
     * @private
     */
    this._inUse = new Set();

    this._preallocatePool(
      Math.min(this._options.preallocationSize, this._options.maximumPoolSize)
    );
  }

  /**
   * @return {Image}
   */
  allocate() {
    if (this._pool.size === 0) {
      // If there is nothing in the pool, add a newly allocated one
      this._pool.add(new Image());
    }

    const iterator = this._pool.values();
    const image = iterator.next().value;

    this._pool.delete(image);
    this._inUse.add(image);

    return image;
  }

  /**
   * @param {Image} image
   */
  free(image) {
    if (!this._inUse.delete(image)) {
      // Image was not part of our pool
      return;
    }

    if (this._pool.size >= this._options.maximumPoolSize) {
      // We already have enough allocated images in the pool
      return;
    }

    this._refurbishImage(image);
    this._pool.add(image);
  }

  /**
   * Return the number of currently available Images in the pool.
   *
   * Everything in the pool can be requested using a call to {@link ImagePool#allocate}.
   * This number does not include the number of already allocated in use images.
   *
   * @returns {number}
   */
  getPoolSize() {
    return this._pool.size;
  }

  /**
   * @param {number} preallocationSize
   * @private
   */
  _preallocatePool(preallocationSize) {
    for (let index = 0; index < preallocationSize; index++) {
      this._pool.add(new Image());
    }
  }

  /**
   * Cleanup an Image object after usage to be reused again.
   *
   * The source value can not be cleaned up again :(
   *
   * @param {Image} image
   * @private
   */
  _refurbishImage(image) {
    image.alt = '';
    image.crossOrigin = null;
    image.height = 0;
    image.isMap = false;
    image.referrerPolicy = '';
    image.useMap = '';
    image.width = 0;
  }
}

ImagePool.DEFAULT_OPTIONS = {
  /**
   * Maximum number of Images stored inside the pool for reuse
   *
   * If more than `maximumPoolSize` images are requested this is possible, but everything above the given limit is
   * automatically destroyed, once a free command is issued.
   */
  maximumPoolSize: 100,

  /**
   * Number of Images preallocated in the pool during construction
   */
  preallocationSize: 50,
};

ImagePool.$inject = [
  'htmlImagePoolOptions', // Injected via Provider
];

export default ImagePool;