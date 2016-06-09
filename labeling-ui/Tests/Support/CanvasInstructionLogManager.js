import fs from 'fs';

class CanvasInstructionLogManager {

  /**
   * @param {Protractor} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

  /**
   * @returns {Promise<String>}
   * @param {string|null} testName
   * @param {string|null} fixtureName
   */
  getCanvasLogs(testName = null, fixtureName = null) {
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

      if (testName !== null && fixtureName !== null) {
        this._createFixture(testName, fixtureName, obj);
      }
      return obj;
    });
  }

  /**
   * @returns {Promise<String>}
   * @param {string|null} testName
   * @param {string|null} fixtureName
   */
  getCrosshairsCanvasLogs(testName = null, fixtureName = null) {
    this._browser.waitForAngular();

    return this._browser.executeScript(() => {
      const canvas = document.getElementsByClassName('crosshairs-layer')[0];
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

      if (testName !== null && fixtureName !== null) {
        this._createFixture(testName, fixtureName, obj);
      }
      return obj;
    });
  }

  /**
   * @param {string} testName
   * @param {string} fixtureName
   * @param {Object} obj
   * @private
   */
  _createFixture(testName, fixtureName, obj) {
    const path = `./Tests/Fixtures/Canvas/${testName}/${fixtureName}.json`;

    this._storeFixture(path, JSON.stringify(obj));
  }

  /**
   * @param {String} targetPath
   * @param data
   * @private
   */
  _storeFixture(targetPath, data) {
    fs.writeFileSync(targetPath, data);

    // Throw an error here, to fail every test, which generates a fixture.
    throw new Error(`Fixture regenerated and stored: ${targetPath}`);
  }
}

export default CanvasInstructionLogManager;