/**
 * Filter responsible for adjusting the contrast of an image
 *
 * @implements {Filter}
 */
export default class ContrastFilter {

  /**
   *
   * @param amount
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
    const factor = (259 * (this._amount + 255)) / (255 * (259 - this._amount));

    for (let index = 0; index < imageData.data.length; index += 4) {
      imageData.data[index] = factor * (imageData.data[index] - 128) + 128;
      imageData.data[index + 1] = factor * (imageData.data[index + 1] - 128) + 128;
      imageData.data[index + 2] = factor * (imageData.data[index + 2] - 128) + 128;
    }

    return imageData;
  }
}
