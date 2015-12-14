import raf from 'raf';

/**
 * Handling requestAnimationFrame browser aware with and without debouncing
 */
class AnimationFrameService {
  constructor() {
  }

  /**
   * Register a callback to be executed on the next animation frame
   *
   * A handle is returned, which may be used to cancel the queued call again, before it is executed
   *
   * @param {Function} callback
   * @returns {int}
   */
  register(callback) {
    return raf(callback);
  }

  /**
   * Cancel the given queued callback identified by the given handle
   *
   * @param {int} id
   */
  cancel(id) {
    raf.cancel(id);
  }

  /**
   * Create a debounced version of the given function
   *
   * Each invocation of the debounced function will be delayed onto the next animation frame
   *
   * If multiple invokations of the function were executed while waiting for a frame only the last one will be
   * executed
   *
   * @param {Function} fn
   * @returns {Function}
   */
  debounce(fn) {
    let lastDebounceHandle = null;

    return (...args) => {
      if (lastDebounceHandle !== null) {
        raf.cancel(lastDebounceHandle);
        lastDebounceHandle = null;
      }

      lastDebounceHandle = raf(() => {
        // Reset the lastDebounceHandle as the frame has been rendered :)
        lastDebounceHandle = null;
        fn(...args);
      });
    };
  }
}

AnimationFrameService.$inject = [
];

export default AnimationFrameService;
