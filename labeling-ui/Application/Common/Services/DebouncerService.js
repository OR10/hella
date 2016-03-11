import lodashDebounce from 'lodash.debounce';

/**
 * Configurable debounce generator service
 */
class DebouncerService {
  /**
   * @param {angular.$window} $window
   */
  constructor($window) {
    /**
     * @type {angular.$window}
     * @private
     */
    this._$window = $window;
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
    const debounceTimeouts = new Map();
    return (...args) => {
      const multiplexerId = multiplexer(...args);
      if (debounceTimeouts.has(multiplexerId)) {
        console.log('multiplex debounce: ', multiplexerId);
        this._$window.clearTimeout(debounceTimeouts.get(multiplexerId));
      } else if (leading === true) {
        fn(...args);
      }

      const timeoutId = this._$window.setTimeout(() => {
        if (leading === false) {
          console.log('debounce execute: ', multiplexerId);
          fn(...args);
        }

        debounceTimeouts.delete(multiplexerId);
      }, wait);

      debounceTimeouts.set(multiplexerId, timeoutId);
    };
  }
}

DebouncerService.$inject = [
  '$window',
];

export default DebouncerService;
