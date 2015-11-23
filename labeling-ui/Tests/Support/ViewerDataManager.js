import fs from 'fs';
import zlib from 'zlib';
import mkdirp from 'mkdirp';
import base64 from 'base64-js';

/**
 * Helper class for testing the viewer drawing features.
 *
 * The Exporter extracts the image data from a currently active viewer. This data can be used
 * in two ways. It can be compared directly to a given fixture, verifying the data drawn by the
 * current test scenario. Secondly, it can be used to generate such fixture data by exporting
 * data from a new test scenario, saving it to disk and verifying the result manually.
 *
 * @class ViewerDataManager
 */
export default class ViewerDataManager {
  /**
   * @param {Protractor} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

  /**
   * @returns {Promise<Object<String, String>>}
   *
   * @private
   */
  _getViewerImageData() {
    this._browser.waitForAngular();

    return this._browser.executeScript(() => {
      const layerManager = document.getElementsByTagName('viewer-stage')[0].__endToEndTestOnlyLayerManager__;

      return JSON.stringify(layerManager.exportLayerData());
    });
  }

  _decodeViewerData(encodedData) {
    const decodedData = {};
    const parsedData = JSON.parse(encodedData);

    Object.keys(parsedData).forEach(layerName => {
      // Don't instatiate an ImageData object here, we don't necessarily need it and the constructor is still experimental
      // see https://developer.mozilla.org/en-US/docs/Web/API/ImageData/ImageData#Browser_compatibility
      decodedData[layerName] = {
        width: parsedData[layerName].width,
        height: parsedData[layerName].height,
        data: base64.toByteArray(parsedData[layerName].data),
      };
    });

    return decodedData;
  }

  /**
   * @param {Object<String, String>}result
   * @param {String} testName
   *
   * @private
   */
  _writeImageDataToFile(result, testName) {
    const exportDestination = `${process.cwd()}/Tests/Exports/${testName}`;

    mkdirp.sync(exportDestination);

    fs.writeFileSync(`${exportDestination}/viewerData.json.gz`, zlib.gzipSync(new Buffer(result, 'utf-8')));
  }

  readViewerData(path) {
    const importPath = `${process.cwd()}/${path}`;

    const encodedData = zlib.gunzipSync(fs.readFileSync(importPath)).toString('utf-8');

    const decodedData = this._decodeViewerData(encodedData);

    return decodedData;
  }

  /**
   * Exports all image data from the AnnoStation viewer.
   *
   * This implementation currently only supports one viewer but should be easily extensible
   * to multiple viewers.
   */
  exportData(writeToFile = false, testName = 'TestOutput') {
    return this._getViewerImageData()
      .then(result => {
        if (writeToFile || process.env.EXPORT_CANVAS_DATA) {
          this._writeImageDataToFile(result, testName);
        }

        const decodedData = this._decodeViewerData(result);

        return decodedData;
      });
  }
}
