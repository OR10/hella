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
   * @param {Array.<string>} urls
   * @param {number?} chunkSize
   */
  fetchMultiple(urls, chunkSize = 4) {
    const fetchMultipleDeferred = this._$q.defer();
    const fetchQueue = clone(urls);
    const activeFetches = [];
    const completedFetches = [];
    let processedIndex = 0;

    const removeFromActive = fetch => {
      const fetchIndex = activeFetches.findIndex(candidate => candidate === fetch);
      if (fetchIndex === -1) {
        throw new Error(`Can't remove non existent entry from activeFetches`);
      }
      activeFetches.splice(fetchIndex, 1);
    };

    const fetchNextInLine = index => {
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
}

ImageFetcher.$inject = [
  '$q',
  'imageFactory',
];

export default ImageFetcher;
