/**
 * Factory for fresh `Image` objects
 */
class ImageFactory {
  /**
   * @returns {Image}
   */
  createImage() {
    return new Image();
  }
}

ImageFactory.$inject = [
];

export default ImageFactory;