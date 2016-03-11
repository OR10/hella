class ViewportResizeHelper {
  constructor(browser) {
    this._browser = browser;
  }

  setViewportSize(width, height) {
    return this.setWindowPosition(0, 0).then(
      () => this._tryToMatchWindowToViewport(width, height, 0)
    );
  }

  getViewportSize() {
    return browser.executeScript(() => {
      var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      return {width, height};
    });
  }

  getWindowSize() {
    return browser.driver.manage().window().getSize();
  }

  setWindowPosition(x, y) {
    return browser.driver.manage().window().setPosition(x, y);
  }

  setWindowSize(width, height) {
    return browser.driver.manage().window().setSize(width, height);
  }

  getScreenResolution() {
    return browser.executeScript(() => {
      const width = window.screen.availWidth;
      const height = window.screen.availHeight;
      return {width, height};
    });
  }

  _tryToMatchWindowToViewport(desiredWidth, desiredHeight, retryCount = 0) {
    return Promise.all([
        this.getViewportSize(),
        this.getWindowSize(),
        this.getScreenResolution()
      ])
      .then(([viewportSize, windowSize, screenResolution]) => {
        const sizeDifference = {
          width: windowSize.width - viewportSize.width,
          height: windowSize.height - viewportSize.height,
        };

        console.log(desiredWidth, desiredHeight, viewportSize, windowSize);
        console.log('setting window size to ', desiredWidth + sizeDifference.width, desiredHeight + sizeDifference.height);
        // Try to resize the window according to the desired viewport.width
        return this.setWindowSize(desiredWidth + sizeDifference.width, desiredHeight + sizeDifference.height);
      })
      .then(() => {
        return this.getViewportSize();
      })
      .then((newViewportSize) => {
        if (
          retryCount < ViewportResizeHelper.MAX_RETRY_COUNT &&
          (newViewportSize.width !== desiredWidth || newViewportSize.height !== desiredHeight)
        ) {
          console.log('does not match yet: ', retryCount);
          // The size is not yet fully adapted. try again
          return this._tryToMatchWindowToViewport(desiredWidth, desiredHeight, retryCount + 1);
        } else {
          console.log('matched!!!!!!!!!11111elf!!!');
        }
      });
  }
}

ViewportResizeHelper.MAX_RETRY_COUNT = 10;

module.exports = ViewportResizeHelper;
