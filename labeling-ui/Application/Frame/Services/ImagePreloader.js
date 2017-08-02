class ImagePreloader {
  /**
   * @param {angular.$q} $q
   * @param {ImageFetcher} imageFetcher
   * @param {ImageCache} imageCache
   * @param {FrameLocationGateway} frameLocationGateway
   * @param {FrameIndexService} frameIndexService
   */
  constructor($q, imageFetcher, imageCache, frameLocationGateway, frameIndexService) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

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

    /**
     * @type {FrameLocationGateway}
     * @private
     */
    this._frameLocationGateway = frameLocationGateway;

    /**
     * @type {FrameIndexService}
     * @private
     */
    this._frameIndexService = frameIndexService;

    /**
     * @type {Map.<Task, FrameLocation[][]>}
     * @private
     */
    this._locations = new Map();

    /**
     * @type {Map.<Task, Number>}
     * @private
     */
    this._positions = new Map();

    /**
     * @type {Map.<string, Array.<Function>>}
     * @private
     */
    this._listeners = new Map();
  }

  /**
   * Preload the given maximum number frames for the specified Task
   *
   * The method may be called multiple times in order to "chunk" the preloading
   * Every call starts at the frame count, which has been the last endpoint.
   *
   * A promise is returned, which indicates once the requested preloading is finished.
   *
   * @param {Task} task
   * @param {Number|undefined} maximumToPreload
   * @param {number|undefined} maxParallelRequests
   */
  preloadImages(task, maximumToPreload = undefined, maxParallelRequests = undefined) {
    let locationsByType;
    let currentPosition;

    return this._$q.resolve()
      .then(() => this._getFrameLocationsByTypeForTask(task))
      .then(loadedLocations => locationsByType = loadedLocations)
      .then(() => currentPosition = this._positions.get(task) || 0)
      .then(() => this._getLocationsToPreload(locationsByType, currentPosition, maximumToPreload))
      .then(({locationsToPreload, newPosition}) => {
        this._positions.set(task, newPosition);
        return this._preloadImagesByLocation(locationsToPreload, maxParallelRequests);
      });
  }

  /**
   * Register an event handler to be informed once changes occur.
   *
   * The return value can be used to deregister the handler again.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {object}
   */
  on(event, listener) {
    let listeners = this._listeners.get(event);
    if (listeners === undefined) {
      listeners = [];
    }

    listeners.push(listener);
    this._listeners.set(event, listeners);

    return {event, listener};
  }

  /**
   * Remove listener registered with {@link ImagePreloader#on}
   *
   * @param {object} identifier
   */
  removeListener(identifier) {
    const listeners = this._listeners.get(identifier.event);

    if (listeners === undefined) {
      return;
    }

    const filteredListeners = listeners.filter(listener => listener !== identifier.listener);
    this._listeners.set(identifier.event, filteredListeners);
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
   * @param {number|undefined} maxParallelRequests
   * @return {Promise.<Array.<HTMLImageElement>>}
   */
  _preloadImagesByLocation(locations, maxParallelRequests) {
    // Only images not in the cache are requested
    const urls = locations.map(location => location.url);
    const nonCachedUrls = urls.filter(url => !this._imageCache.hasImageForUrl(url));

    let completedImages = locations.length - nonCachedUrls.length;

    if (nonCachedUrls.length === 0) {
      return this._$q.resolve([]);
    }

    this._emit('preload:started', {
      locationsInChunk: locations,
      imageCountInChunk: locations.length,
    });

    return this._$q.resolve()
      .then(() => this._imageFetcher.fetchMultiple(nonCachedUrls, maxParallelRequests))
      .then(
        images => {
          this._emit('preload:finished', {
            locationsInChunk: locations,
            imageCountInChunk: locations.length,
            images
          });

          return images;
        },
        undefined,
        // progress/notify callback
        image => {
          completedImages += 1;
          this._imageCache.addImage(image);
          this._emit('image:loaded', {
            image,
            locationsInChunk: locations,
            imageCountInChunk: locations.length,
            imageCountInChunkCompleted: completedImages
          });
        }
      );
  }

  /**
   * @param {string} event
   * @param {*} data
   * @private
   */
  _emit(event, data) {
    if (!this._listeners.has(event)) {
      return;
    }

    const listeners = this._listeners.get(event);
    listeners.forEach(listener => listener(data));
  }

  /**
   * @param {Task} task
   * @returns {Promise.<FrameLocation[][]>}
   * @private
   */
  _getFrameLocationsByTypeForTask(task) {
    if (this._locations.has(task)) {
      return this._$q.resolve(this._locations.get(task));
    }

    const imageTypePreferences = [['source', 'sourceJpg'], ['thumbnail']];
    const imageTypes = imageTypePreferences
    // Remove all types not available for this task
      .map(typeList => typeList.filter(
        typeCandidate => task.requiredImageTypes.includes(typeCandidate)
      ))
      // Cleanup empty typelists
      .filter(typeList => typeList.length > 0)
      // Take the type from each list with the highest priority
      .map(typeList => typeList[0]);

    const frameIndexLimits = this._frameIndexService.getFrameIndexLimits();

    return this._$q.all(
      imageTypes.map(imageType => this._frameLocationGateway.getFrameLocations(task.id, imageType, 0, frameIndexLimits.upperLimit + 1))
    );
  }

  /**
   * @param {FrameLocation[][]} locationsByType
   * @param {number} currentPosition
   * @param {number|undefined} maximumToPreload
   * @returns {{locationsToPreload: FrameLocation[], newPosition: number}}
   * @private
   */
  _getLocationsToPreload(locationsByType, currentPosition, maximumToPreload) {
    let newPosition;
    if (maximumToPreload === undefined) {
      newPosition = locationsByType[0].length
    } else {
      newPosition = Math.min(locationsByType[0].length, currentPosition + maximumToPreload);
    }

    const locationsToPreload = locationsByType.map(
      locations => locations.slice(currentPosition, newPosition)
    );

    return {
      locationsToPreload: [].concat(...locationsToPreload),
      newPosition,
    };
  }
}

ImagePreloader.$inject = [
  '$q',
  'imageFetcher',
  'imageCache',
  'frameLocationGateway',
  'frameIndexService',
];

export default ImagePreloader;