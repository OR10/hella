class CanvasInstructionLogManager {

  /**
   *
   * @param {Protractor} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

  /**
   * @returns {Promise<String>}
   */
  getCanvasLogs() {
    this._browser.waitForAngular();

    return this._browser.executeScript(() => {
      const context = document.getElementsByClassName('annotation-layer')[0].getContext('2d');

      return context.json();
    }).then((logs) => {
      return JSON.parse(logs);
    });
  }
}

export default CanvasInstructionLogManager;