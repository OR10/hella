import {debounce as lodashDebounce} from 'lodash';
import Debouncer from './DebouncerService/Debouncer';

/**
 * Configurable debounce generator service
 */
class DebouncerService {
  /**
   * @param {angular.$window} $window
   * @param {angular.$q} $q
   */
  constructor($window, $q) {
    /**
     * @type {angular.$window}
     * @private
     */
    this._$window = $window;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;
  }

  /**
   * Create a debounced version of the given function.
   *
   * The function is debounced using the given `wait` time in msecs.
   *
   * The optional `leading` flag allows to execute the debounced function on the leading edge of execution,
   * not on the trailing edge, which is the default.
   *
   * @param {Function} fn
   * @param {Integer} wait
   * @param {Boolean} leading
   */
  debounce(fn, wait, leading = false) {
    return lodashDebounce(fn, wait, {leading, trailing: !leading});
  }

  /**
   * Create a multiplexed debouncer function.
   *
   * Multiplexed debounce functions provide different categories of debouncing.
   *
   * Each invocation is given to the multiplexer function, which in turn returns some sort of unique identifier.
   * Debouncing is then decided based on those identifiers. Two invocations with the same identifier will be debounced,
   * while an invocation with a different identifier is handled on its own.
   *
   * @param {Function} fn
   * @param {Function} multiplexer
   * @param {Integer} wait
   * @param {Boolean} leading
   */
  multiplexDebounce(fn, multiplexer, wait, leading = false) {
    return new Debouncer(this._$window, this._$q, fn, multiplexer, wait, leading);
  }
}

DebouncerService.$inject = [
  '$window',
  '$q',
];

export default DebouncerService;
