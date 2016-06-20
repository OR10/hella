import resemble from 'node-resemble-js';
import Canvas, {ImageData} from 'canvas';

/**
 * Image comparison via the resemble library
 */
class ImageComparisonService {
  /**
   * Compare to encoded image data structures using resemble
   * 
   * ATTENTION: Should not be used to compare pictures of the thing layer.
   * 
   * @param {{width: number, height: number, data: string}} firstEncodedImageData
   * @param {{width: number, height: number, data: string}} secondEncodedImageData
   * @param {boolean} ignoreAntialiasing
   * @param {boolean} ignoreColors
   * @returns {Promise.<Object>}
   */
  compare(firstEncodedImageData, secondEncodedImageData, ignoreAntialiasing = true, ignoreColors = false) {
    const actualPng = this._getPngData(firstEncodedImageData);
    const expectedPng = this._getPngData(secondEncodedImageData);

    return new Promise(resolve => {
      const diff = resemble(actualPng)
        .compareTo(expectedPng);

      if (ignoreAntialiasing === true) {
        diff.ignoreAntialiasing();
      }

      if (ignoreColors === true) {
        diff.ignoreColors();
      }

      diff
        .onComplete(data => {
          data.actualPng = actualPng;
          data.expectedPng = expectedPng;
          resolve(data);
        });
    });
  }

  /**
   * Create a png image from encodedImageData
   * @param encodedImageData
   * @private
   */
  _getPngData(encodedImageData) {
    const decodedData = new Uint8ClampedArray(new Buffer(encodedImageData.data, 'base64'));
    const imageData = new ImageData(decodedData, encodedImageData.width, encodedImageData.height);
    const canvas = new Canvas(encodedImageData.width, encodedImageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    return canvas.toBuffer();
  }
}

export default ImageComparisonService;
