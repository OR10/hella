import _ from 'lodash';
import mkdirp from 'mkdirp';
import fs from 'fs';
import path from 'path';
import {default as Canvas, ImageData} from 'canvas';

/**
 * Jasmine reporter for visualizing image diffs
 *
 * The reporter will create a simple screen shot in case there was no mismatch.
 * This is due to a limitation in jasmine itself which prevents the reporter
 * from accessing expected and actual data from successful matches.
 */
class ImageDiffReporter {
  constructor(options) {
    this._options = this._initOptions(options);

    this._currentSuite = null;
  }

  /**
   * @param {Object} options
   * @returns {Object}
   * @private
   */
  _initOptions(options) {
    const defaults = {
      browserIdentifier: '',
    };

    const initializedOptions = Object.assign({}, defaults, options);

    initializedOptions.outputDir = path.resolve(process.cwd(), initializedOptions.outputDir);

    return initializedOptions;
  }

  suiteStarted(suite) {
    this._currentSuite = suite;
  }

  _imageDiff(lhs, rhs) {
    const diffImageData = new ImageData(lhs.width, lhs.height);

    for (let i = 0; i < lhs.data.length; i += 4) {
      diffImageData.data[i] = Math.abs(lhs.data[i] - rhs.data[i]);
      diffImageData.data[i + 1] = Math.abs(lhs.data[i + 1] - rhs.data[i + 1]);
      diffImageData.data[i + 2] = Math.abs(lhs.data[i + 2] - rhs.data[i + 2]);
      diffImageData.data[i + 3] = Math.abs(255 - Math.abs(lhs.data[i + 3] - rhs.data[i + 3]));
    }

    return diffImageData;
  }

  _storeScreenShot(imageBasePath) {
    mkdirp.sync(imageBasePath);

    browser.takeScreenshot().then(data => {
      fs.writeFileSync(imageBasePath + '/screenshot.png', new Buffer(data, 'base64'));
    });
  }

  _storeImage(targetPath, imageData) {
    const canvas = new Canvas(imageData.width, imageData.height);
    const context = canvas.getContext('2d');

    context.putImageData(imageData, 0, 0);

    fs.writeFileSync(targetPath, canvas.toBuffer());
  }

  _createImageData(rawImageData) {
    const imageData = new ImageData(rawImageData.width, rawImageData.height);

    for (let i = 0; i < rawImageData.data.length; i++) {
      imageData.data[i] = rawImageData.data[i];
    }

    return imageData;
  }

  specDone(spec) {
    if (spec.status === 'disabled') {
      return;
    }

    const imageBasePath = `${this._options.outputDir}/${this._options.browserIdentifier}/${this._currentSuite.description}/${spec.description}`;

    if (spec.failedExpectations.length === 0) {
      this._storeScreenShot(imageBasePath);
    }

    const failedViewerDataExpectations = spec.failedExpectations.filter(expectation => expectation.matcherName === 'toEqualViewerData');

    failedViewerDataExpectations.forEach((expectation, index) => {
      let expectationPathSegment = '';

      if (failedViewerDataExpectations.length > 1) {
        expectationPathSegment = `/${index}`;
      }

      Object.keys(expectation.expected).forEach(key => {
        const expectationImagePath = `${imageBasePath}${expectationPathSegment}/${key}`;
        mkdirp.sync(expectationImagePath);

        const expectedImageRawData = expectation.expected[key];
        const actualImageRawData = expectation.actual[key];

        const actualImageData = this._createImageData(actualImageRawData);
        const expectedImageData = this._createImageData(expectedImageRawData);
        const diffImageData = this._imageDiff(expectedImageRawData, actualImageRawData);

        this._storeImage(expectationImagePath + '/actual.png', actualImageData);
        this._storeImage(expectationImagePath + '/expected.png', expectedImageData);
        this._storeImage(expectationImagePath + '/diff.png', diffImageData);
      });
    });
  }
}

export default ImageDiffReporter;
