import mkdirp from 'mkdirp';
import fs from 'fs';
import path from 'path';
import Canvas, {ImageData} from 'canvas';
import CanteenStackRenderer from '../../../../Support/CanteenStackRenderer';

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

    this._suiteStack = [];
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
    this._suiteStack.push(suite);
  }

  suiteDone(suite) {
    this._suiteStack.pop();
  }

  _diffImageData(lhs, rhs) {
    const diffImageData = new ImageData(lhs.width, lhs.height);

    for (let i = 0; i < lhs.data.length; i += 4) {
      diffImageData.data[i] = Math.abs(lhs.data[i] - rhs.data[i]);
      diffImageData.data[i + 1] = Math.abs(lhs.data[i + 1] - rhs.data[i + 1]);
      diffImageData.data[i + 2] = Math.abs(lhs.data[i + 2] - rhs.data[i + 2]);
      diffImageData.data[i + 3] = Math.abs(255 - Math.abs(lhs.data[i + 3] - rhs.data[i + 3]));
    }

    const canvas = new Canvas(lhs.width, lhs.height);
    canvas.getContext('2d').putImageData(diffImageData, 0, 0);
    return canvas;
  }

  _storeScreenShot(imageBasePath) {
    mkdirp.sync(imageBasePath);

    browser.takeScreenshot().then(data => {
      fs.writeFileSync(imageBasePath + '/screenshot.png', new Buffer(data, 'base64'));
    });
  }

  _storeCanvas(targetPath, canvas) {
    fs.writeFileSync(targetPath, canvas.toBuffer());
  }

  specDone(spec) {
    if (spec.status === 'disabled') {
      return;
    }

    const allSuiteNames = this._suiteStack.map(suite => suite.description);
    const fullSuiteName = allSuiteNames.join(' ');

    const imageBasePath = `${this._options.outputDir}/${this._options.browserIdentifier}/${fullSuiteName}/${spec.description}`;

    if (spec.failedExpectations.length === 0) {
      this._storeScreenShot(imageBasePath);
    }

    const failedDrawingStackExpectations = spec.failedExpectations.filter(
      expectation => {
        switch (expectation.matcherName) {
          case 'toEqualDrawingStack':
          case 'toEqualRenderedDrawingStack':
            return true;
          default:
            return false;
        }
      }
    );

    failedDrawingStackExpectations.forEach((expectation, index) => {
      let expectationPathSegment = '';

      if (failedDrawingStackExpectations.length > 1) {
        expectationPathSegment = `/${index}`;
      }

      const expectationImagePath = `${imageBasePath}${expectationPathSegment}`;
      mkdirp.sync(expectationImagePath);

      const expectedDrawingStack = expectation.expected;
      const actualDrawingStack = expectation.actual;

      const renderer = new CanteenStackRenderer('black');
      const expectedCanvas = renderer.render(expectedDrawingStack);
      const actualCanvas = renderer.render(actualDrawingStack);

      const expectedImageData = expectedCanvas.getContext('2d').getImageData(0, 0, expectedCanvas.width, expectedCanvas.height);
      const actualImageData = actualCanvas.getContext('2d').getImageData(0, 0, actualCanvas.width, actualCanvas.height);

      const diffCanvas = this._diffImageData(expectedImageData, actualImageData);

      this._storeCanvas(expectationImagePath + '/actual.png', actualCanvas);
      this._storeCanvas(expectationImagePath + '/expected.png', expectedCanvas);
      this._storeCanvas(expectationImagePath + '/diff.png', diffCanvas);
    });
  }
}

export default ImageDiffReporter;
