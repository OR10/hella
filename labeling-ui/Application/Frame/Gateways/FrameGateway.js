/**
 * Gateway to interact with {@link FrameLocation}s
 *
 * This gateway is capable of preloading creating and interacting with {@link FrameLocation} models.
 */
export default class FrameGateway {
  /**
   * Create and return an {@link Image} for the given {@link FrameLocation}
   *
   * @param location
   * @returns {Promise<HTMLImageElement>}
   */
  getImage(location) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = location.url;
      image.crossOrigin = 'Anonymous';
    });
  }
}
