/**
 * Webdriver/Protractor helper to ensure deterministic properties of the Viewport
 * during test runs.
 *
 * Most likely protractors `onPrepare` method is where you want to use the `ViewportResizeHelper`
 */
class ViewportHelper {
  /**
   * @param {WebDriver.Browser} browser
   */
  constructor(browser) {
    /**
     * @type {WebDriver.Browser}
     * @private
     */
    this._browser = browser;
  }

  /**
   * Enforce a certain size of the Viewport
   *
   * The Browser window holding this Viewport has to fit into the currently active screen resolution for this to work.
   *
   * @param {Integer} width
   * @param {Integer} height
   * @returns {Promise}
   */
  setViewportSize(width, height) {
    return this.setWindowPosition(0, 0).then(
      () => this._tryToMatchWindowToViewport(width, height, 0)
    );
  }

  /**
   * Get the current Viewport size of the browser window
   *
   * @returns {!promise.Promise.<{width: Integer, height: Integer}>}
   */
  getViewportSize() {
    return browser.executeScript(() => {
      var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      return {width, height};
    });
  }

  /**
   * Get the window size of the browser window
   *
   * The window size does include all of the window chrome around the viewport
   *
   * @returns {!promise.Promise.<{width: number, height: number}>}
   */
  getWindowSize() {
    return browser.driver.manage().window().getSize();
  }

  /**
   * Enforce the browser window to be at a certain position on screen
   *
   * @param {Integer} x
   * @param {Integer} y
   * @returns {!promise.Promise}
   */
  setWindowPosition(x, y) {
    return browser.driver.manage().window().setPosition(x, y);
  }

  /**
   * Set the size of the Browser window
   *
   * The size does include all the window chrome.
   *
   * Be aware that setting two different browsers to the same window size does not ensure that their
   * viewports have the same size.
   *
   * @param {Integer} width
   * @param {Integer} height
   * @returns {!promise.Promise}
   */
  setWindowSize(width, height) {
    return browser.driver.manage().window().setSize(width, height);
  }

  /**
   * Get the screen resolution of the system the browser is currently running on.
   *
   * @returns {!promise.Promise.<{width: Integer, height: Integer}>}
   */
  getScreenResolution() {
    if (process.env.HEADLESS === 'true') {
      // In headless mode the reported value is not correct. Therefore fallback to fullhd
      return Promise.resolve({width: 1920, height: 1080});
    }

    return browser.executeScript(() => {
      const width = window.screen.availWidth;
      const height = window.screen.availHeight;
      return {width, height};
    });
  }

  /**
   * Try and match the browser windows size to house a viewport of the given dimensions
   *
   * This method may recursively call itself up to `ViewportResizeHelper.MAX_RETRY_COUNT` times in order to
   * try archieving its goal.
   *
   * @param {Integer} desiredWidth
   * @param {Integer} desiredHeight
   * @param {Integer} retryCount
   * @returns {Promise}
   * @private
   */
  _tryToMatchWindowToViewport(desiredWidth, desiredHeight, retryCount = 0) {
    return Promise.all([
      this.getViewportSize(),
      this.getWindowSize(),
      this.getScreenResolution(),
    ])
      .then(([viewportSize, windowSize, screenResolution]) => {
        const sizeDifference = {
          width: windowSize.width - viewportSize.width,
          height: windowSize.height - viewportSize.height,
        };

        if (sizeDifference.width < 0 || sizeDifference.height < 0) {
          throw new Error(
            `The viewport is bigger than the browser window ${windowSize.width}x${windowSize.width} -> ${viewportSize.width}x${viewportSize.height}. Therefore the viewport size does not seem to be connected to the window size and can not be easily manipulated by webdriver. Maybe device emulation mode is switched on?`
          );
        }

        // Calculate most likely window size to result in desired viewport dimensions
        const likelyWidth = desiredWidth + sizeDifference.width;
        const likelyHeight = desiredHeight + sizeDifference.height;

        if (likelyWidth > screenResolution.width || likelyHeight > screenResolution.height) {
          throw new Error(
            `Your screen seems to be to small to fit a browser window with viewport size ${desiredWidth}x${desiredHeight} onto it. This would require a browser window size of ${likelyWidth}x${likelyHeight}, which does not fit onto your ${screenResolution.width}x${screenResolution.height} screen.`
          );
        }

        return this.setWindowSize(likelyWidth, likelyHeight);
      })
      .then(() => this.getViewportSize())
      .then((newViewportSize) => {
        if (
          retryCount < ViewportHelper.MAX_RETRY_COUNT &&
          (newViewportSize.width !== desiredWidth || newViewportSize.height !== desiredHeight)
        ) {
          // The size is not yet fully adapted. try again
          return this._tryToMatchWindowToViewport(desiredWidth, desiredHeight, retryCount + 1);
        }
      });
  }
}

ViewportHelper.MAX_RETRY_COUNT = 10;

module.exports = ViewportHelper;
