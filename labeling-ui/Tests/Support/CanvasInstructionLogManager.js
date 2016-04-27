import fs from 'fs';

class CanvasInstructionLogManager {

  /**
   * @param {Protractor} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

  /**
   * @param {Boolean} createFixture
   * @returns {Promise<String>}
   */
  getCanvasLogs(createFixture = false) {
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
          decimalPoints: 8,
        }),
      };
    }).then((obj) => {
      obj.operations = JSON.parse(obj.operations);

      if (createFixture) {
        this._createFixture(obj);
      }
      return obj;
    });
  }

  /**
   * @param {Object} obj
   * @private
   */
  _createFixture(obj) {
    const filename = `fixture_${Date.now() / 1000}.json`;
    const path = `./Tests/Fixtures/Canvas/${filename}`;

    this._storeFixture(path, JSON.stringify(obj));
  }

  /**
   * @param {String} targetPath
   * @param data
   * @private
   */
  _storeFixture(targetPath, data) {
    fs.writeFileSync(targetPath, data);
  }
}

export default CanvasInstructionLogManager;