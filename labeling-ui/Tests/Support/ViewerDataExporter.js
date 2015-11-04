import fs from 'fs';
import mkdirp from 'mkdirp';

/**
 * Helper class for testing the viewer drawing features.
 *
 * The Exporter extracts the image data from a currently active viewer. This data can be used
 * in two ways. It can be compared directly to a given fixture, verifying the data drawn by the
 * current test scenario. Secondly, it can be used to generate such fixture data by exporting
 * data from a new test scenario, saving it to disk and verifying the result manually.
 *
 * @class ViewerDataExporter
 */
export default class ViewerDataExporter {
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
    return this._browser.executeScript(() => {
      const layerManager = document.getElementsByTagName('viewer-stage')[0].__endToEndTestOnlyLayerManager__;

      return layerManager.exportLayerData();
    });
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

    Object.keys(result).forEach((key) => {
      const dataUrl = result[key];
      const [ignored, extension, data] = dataUrl.match(/^data:.+\/(.+);base64,(.*)$/);
      const buffer = new Buffer(data, 'base64');

      fs.writeFileSync(`${exportDestination}/${key}.${extension}`, buffer);
    });

    fs.writeFileSync(`${exportDestination}/viewerData.json`, JSON.stringify(result));
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

        return result;
      });
  }
}
