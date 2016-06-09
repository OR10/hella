import fs from 'fs';

class CanvasInstructionLogManager {

  /**
   * @param {Protractor} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

  /**
   * Retrieve the canteen canvas logs of an arbitrary canvas identified by a class
   *
   * The first match of the class will be taken as result.
   *
   * @param {string} canvasClass
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   * @private
   */
  _getCanvasLogs(canvasClass, testName, fixtureName) {
    this._browser.waitForAngular();

    return this._browser.executeScript((canvasClass) => { // eslint-disable-line no-shadow
      const canvasList = document.getElementsByClassName(canvasClass);
      if (canvasList.length === 0) {
        return null;
      }
      const canvas = canvasList[0];
     
      const ctx = canvas.getContext('2d');

      const width = canvas.width;
      const height = canvas.height;

      return {
        width,
        height,
        operations: ctx.json({
          decimalPoints: 8,
        }),
      };
    }, canvasClass)
      .then((obj) => {
        if (obj === null) {
          throw new Error(`Unable to retrieve canvas logs of ${canvasClass}`);
        }
        
        obj.operations = JSON.parse(obj.operations);

        if (testName !== null && fixtureName !== null) {
          this._createFixture(testName, fixtureName, obj);
        }
        return obj;
      });
  }

  /**
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   */
  getAnnotationCanvasLogs(testName = null, fixtureName = null) {
    return this._getCanvasLogs('annotation-layer', testName, fixtureName);
  }

  /**
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   */
  getCrosshairsCanvasLogs(testName = null, fixtureName = null) {
    return this._getCanvasLogs('crosshairs-layer', testName, fixtureName);
  }

  /**
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   */
  getBackgroundCanvasLogs(testName = null, fixtureName = null) {
    return this._getCanvasLogs('background-layer', testName, fixtureName);
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