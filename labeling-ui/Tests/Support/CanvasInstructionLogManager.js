import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

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
    return Promise.resolve()
      .then(() => this._browser.waitForAngular())
      .then(() => this._browser.executeAsyncScript((canvasClass, done) => { // eslint-disable-line no-shadow
        const canvasList = document.getElementsByClassName(canvasClass);
        if (canvasList.length === 0) {
          return null;
        }
        const canvas = canvasList[0];

        const ctx = canvas.getContext('2d');

        const width = canvas.width;
        const height = canvas.height;

        done({
          width,
          height,
          operations: ctx.stack({
            decimalPoints: 8,
          }),
        });
      }, canvasClass))
      .then(obj => {
        if (obj === null) {
          throw new Error(`Unable to retrieve canvas logs of ${canvasClass}`);
        }

        if (testName !== null && fixtureName !== null) {
          this._createFixture(testName, fixtureName, obj);
        }
        return obj;
      });
  }

  /**
   * Retrieve the drawn pixels an arbitrary canvas identified by a class
   *
   * The first match of the class will be taken as result.
   *
   * USE WITH CAUTION: The bitmap representation may differ on different machines/browser. Only use this if you are sure
   * the rendered information is rendered identically on all systems.
   *
   * @param {string} canvasClass
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   * @private
   */
  _getCanvasImage(canvasClass, testName, fixtureName) {
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

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let encodedData = '';
      for (let i = 0; i < imageData.data.byteLength; i++) {
        encodedData += String.fromCharCode(imageData.data[i]);
      }

      return {
        width,
        height,
        data: btoa(encodedData),
      };
    }, canvasClass)
      .then((canvasImage) => {
        if (canvasImage === null) {
          throw new Error(`Unable to retrieve canvas image of ${canvasClass}`);
        }

        if (testName !== null && fixtureName !== null) {
          this._createFixture(testName, fixtureName, canvasImage);
        }

        return canvasImage;
      });
  }

  /**
   * @param {string|null} testName
   * @param {string|null} fixtureName
   * @returns {Promise<{width: number, height: number, operations: Array}>}
   */
  getAnnotationCanvasLogs(testName = null, fixtureName = null) {
    const canvasLogs = this._getCanvasLogs('annotation-layer', testName, fixtureName);
    return Promise.resolve(canvasLogs);
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
  getBackgroundCanvasImage(testName = null, fixtureName = null) {
    return this._getCanvasImage('background-layer', testName, fixtureName);
  }

  /**
   * @param {string} testName
   * @param {string} fixtureName
   * @param {Object} obj
   * @private
   */
  _createFixture(testName, fixtureName, obj) {
    const fixturePath = `./Tests/Fixtures/Canvas/${testName}/${fixtureName}.json`;

    this._storeFixture(fixturePath, JSON.stringify(obj));
  }

  /**
   * @param {String} targetPath
   * @param data
   * @private
   */
  _storeFixture(targetPath, data) {
    const directoryPath = path.dirname(targetPath);
    if (!fs.existsSync(directoryPath)) {
      mkdirp.sync(directoryPath);
    }

    fs.writeFileSync(targetPath, data);

    // Throw an error here, to fail every test, which generates a fixture.
    // throw new Error(`Fixture regenerated and stored: ${targetPath}`);
    expect('').toEqual(`Fixture regenerated and stored: ${targetPath}`);
  }
}

export default CanvasInstructionLogManager;
