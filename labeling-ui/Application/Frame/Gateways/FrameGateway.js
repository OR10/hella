/**
 * Gateway to interact with {@link FrameLocation}s
 *
 * This gateway is capable of preloading creating and interacting with {@link FrameLocation} models.
 */
class FrameGateway {
  /**
   * Create and return an {@link HTMLImageElement} for the given {@link FrameLocation}
   *
   * @param {FrameLocation} location
   * @returns {Promise.<HTMLImageElement>}
   */
  getImage(location) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.crossOrigin = 'Anonymous';
      image.src = location.url;
    });
  }
}

export default FrameGateway;
