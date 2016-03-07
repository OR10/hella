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
      const canvas = document.getElementsByClassName('annotation-layer')[0];
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      return {
        width,
        height,
        operations: context.json({
          decimalPoints: 8
        })
      };
    }).then((obj) => {
      obj.operations = JSON.parse(obj.operations);
      return obj;
    });
  }
}

export default CanvasInstructionLogManager;