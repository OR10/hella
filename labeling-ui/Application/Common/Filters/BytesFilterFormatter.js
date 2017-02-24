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
  format(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    let units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
      number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  }
}
