import {clone} from 'lodash';

/**
 * Naive implementation of the needed logic to fetch an Image using its url.
 *
 * The loaded image will be provided as instantiated and fully loaded Image object.
 */
class ImageFetcher {
  /**
   * @param {angular.$q} $q
   * @param {ImageFactory} imageFactory
   */
  constructor($q, imageFactory) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {ImageFactory}
     * @private
     */
    this._imageFactory = imageFactory;

    /**
     * State of aborted ids
     *
     * All ids in this set are marked as aborted.
     *
     * @type {Set}
     * @private
     */
    this._abortedIds = new Set();

    /**
     * A list of running fetches by their fetchId
     *
     * Note: Only multifetches, which have been given a `fetchId´ are stored in here.
     *
     * One fetchId may be assigned to multiple fetches.
     *
     * @type {Map.<string, Promise[]>}
     * @private
     */
    this._runningMultiFetchesById = new Map();
  }

  /**
   * Fetch a single image with the given url
   *
   * @param {string} url
   * @returns {Promise.<Image>}
   */
  fetch(url) {
    return this._$q((resolve, reject) => {
      const image = this._imageFactory.createImage();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.crossOrigin = 'Anonymous';
      image.src = url;
    });
  }

  /**
   * Fetch a list of multiple images by their urls.
   *
   * A maximum of `chunkSize` images will be fetched in parallel.
   *
   * By default a maximum of 4 images is fetched in parallel.
   *
   * Optionally an id may be specified, which can be used to abort the multifetch later on
   * Please be adviced, that you are responsible for chosing a unique id. If two fetching
   * operations with the same id are started and this id is aborted, both operations will be
   * cancelled. Cancelled fetching operations will simply terminate successfully after the
   * currently active chunk has been fetched.
   *
   * @param {Array.<string>} urls
   * @param {number?} chunkSize
   * @param {string} fetchId
   * @returns {Promise.<Image[]>}
   */
  fetchMultiple(urls, chunkSize = 4, fetchId = undefined) {
    const fetchMultipleDeferred = this._$q.defer();
    let fetchQueue = clone(urls);
    const activeFetches = [];
    const completedFetches = [];
    let processedIndex = 0;

    if (fetchId !== undefined) {
      this._addFetchWithId(fetchId, fetchMultipleDeferred.promise);
    }

    const removeFromActive = fetch => {
      const fetchIndex = activeFetches.findIndex(candidate => candidate === fetch);
      if (fetchIndex === -1) {
        throw new Error(`Can't remove non existent entry from activeFetches`);
      }
      activeFetches.splice(fetchIndex, 1);
    };

    const fetchNextInLine = index => {
      if (fetchId !== undefined && this._abortedIds.has(fetchId)) {
        // Do not queue any more items and resolve as soon as all active
        // have been finished
        fetchQueue = [];
      }

      if (activeFetches.length >= chunkSize) {
        return;
      }

      if (fetchQueue.length === 0 && activeFetches.length === 0) {
        fetchMultipleDeferred.resolve(this._$q.all(completedFetches));
        return;
      }

      if (fetchQueue.length === 0) {
        return;
      }

      const nextUrl = fetchQueue.shift();
      processedIndex = processedIndex + 1;

      const currentFetch = this.fetch(nextUrl);
      activeFetches.push(currentFetch);

      currentFetch
        .then(completedImage => {
          completedFetches[index] = currentFetch;
          removeFromActive(currentFetch);
          fetchMultipleDeferred.notify(completedImage);
          setTimeout(() => fetchNextInLine(processedIndex), 1);
        })
        .catch(error => {
          fetchMultipleDeferred.reject(error);
        });

      // Recursively fill activeFetches to the limit.
      setTimeout(() => fetchNextInLine(processedIndex), 1);
    };

    fetchNextInLine(processedIndex);

    return fetchMultipleDeferred.promise;
  }

  /**
   * Abort a fetch running under a specific id.
   *
   * All fetches with the given id will be aborted as soon as there current
   * chunk has been processed.
   *
   * @param {string} fetchId
   */
  abortFetchMultiple(fetchId) {
    if (!this._runningMultiFetchesById.has(fetchId)) {
      throw new Error(`Tried to abort multi fetch with unknown id "${fetchId}".`);
    }

    this._abortedIds.add(fetchId);
  }

  /**
   * Check if a multifetch registered under a certain id is still
   * running
   *
   * @param {string} fetchId
   */
  isFetchMultipleRunning(fetchId) {
    return this._runningMultiFetchesById.has(fetchId);
  }

  /**
   * @param fetchId
   * @param promise
   * @private
   */
  _addFetchWithId(fetchId, promise) {
    if (!this._runningMultiFetchesById.has(fetchId)) {
      this._runningMultiFetchesById.set(fetchId, []);
    }

    const runningFetches = this._runningMultiFetchesById.get(fetchId);
    runningFetches.push(promise);

    // Automatically track the finishing of the given promise and handle the appropriate state change
    promise
      .then(() => this._finishFetchWithId(fetchId, promise))
      .catch(() => this._finishFetchWithId(fetchId, promise));
  }

  _finishFetchWithId(fetchId, promise) {
    if (!this._runningMultiFetchesById.has(fetchId)) {
      return;
    }

    const runningFetches = this._runningMultiFetchesById.get(fetchId);
    const fetchIndex = runningFetches.findIndex(candidate => candidate === promise);
    runningFetches.splice(fetchIndex, 1);

    if (runningFetches.length === 0) {
      this._runningMultiFetchesById.delete(fetchId);
      // Remove all aborted markers once all corresponding sessions have terminated.
      if (this._abortedIds.has(fetchId)) {
        this._abortedIds.delete(fetchId);
      }
    }
  }
}

ImageFetcher.$inject = [
  '$q',
  'imageFactory',
];

export default ImageFetcher;
