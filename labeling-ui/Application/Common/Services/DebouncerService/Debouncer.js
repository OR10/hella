/**
 * Debouncer for debouncing functions
 */
class Debouncer {
  /**
   * @param {angular.$window} $window
   * @param {angular.$q} $q
   * @param {Function} fn
   * @param {Function} multiplexer
   * @param {Integer} wait
   * @param {Boolean} leading
   */
  constructor($window, $q, fn, multiplexer, wait, leading) {
    this._$window = $window;
    this._$q = $q;
    this._fn = fn;
    this._multiplexer = multiplexer;
    this._wait = wait;
    this._leading = leading;

    this._debounceTimeouts = new Map();
    this._debounceFunctions = new Map();
  }

  /**
   * @param args
   */
  debounce(...args) {
    const multiplexerId = this._multiplexer(...args);
    if (this._debounceTimeouts.has(multiplexerId)) {
      this._$window.clearTimeout(this._debounceTimeouts.get(multiplexerId));
    } else if (this._leading === true) {
      this._fn(...args);
    }

    const timeoutId = this._$window.setTimeout(() => {
      if (this._leading === false) {
        this._fn(...args);
      }

      this._debounceTimeouts.delete(multiplexerId);
      this._debounceFunctions.delete(multiplexerId);
    }, this._wait);

    this._debounceTimeouts.set(multiplexerId, timeoutId);
    this._debounceFunctions.set(multiplexerId, () => {
      if (typeof this._fn.then === 'function') {
        return this._fn(...args);
      }

      this._fn(...args);
      return this._$q.resolve();
    });
  }

  /**
   * Trigger all debounced functions immediately and remove all pending timeouts
   *
   * @returns {Promise}
   */
  triggerImmediately() {
    const promises = [];
    this._debounceFunctions.forEach((fn, multiplexerId) => {
      this._$window.clearTimeout(this._debounceTimeouts.get(multiplexerId));
      promises.push(fn());
      this._debounceTimeouts.delete(multiplexerId);
      this._debounceFunctions.delete(multiplexerId);
    });
    return this._$q.all(promises);
  }
}


export default Debouncer;
