/**
 * This Filter formats bytes in readable units
 *
 * @implements {Filter}
 */
export default class BytesFilterFormatter {
  /**
   *
   * @param bytes
   * @param precision
   * @returns {string}
   */
  format(bytes, precision = 1) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (bytes === 0) {
      return '0 bytes';
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }
}
