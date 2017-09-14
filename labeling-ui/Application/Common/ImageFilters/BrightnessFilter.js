/**
 * Filter responsible for adjusting the brightness of an image
 *
 * @class BrightnessFilter
 * @implements {Filter}
 */
export default class BrightnessFilter {

  /**
   * @param {int} amount
   */
  constructor(amount) {
    /**
     * @type {int}
     * @private
     */
    this._amount = amount;
  }

  /**
   * Perform the manipulation of the image data
   *
   * @param {ImageData} imageData
   * @returns {ImageData}
   */
  manipulate(imageData) {
    for (let index = 0; index < imageData.data.length; index += 4) {
      imageData.data[index] += this._amount;
      imageData.data[index + 1] += this._amount;
      imageData.data[index + 2] += this._amount;
    }

    return imageData;
  }
}
