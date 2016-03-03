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

  _diffCanvas(lhsCanvas, rhsCanvas) {
    const lhs = lhsCanvas.getContext('2d').getImageData(0, 0, lhsCanvas.width, lhsCanvas.height);
    const rhs = rhsCanvas.getContext('2d').getImageData(0, 0, rhsCanvas.width, rhsCanvas.height);

    const diffImageData = new ImageData(lhsCanvas.width, lhsCanvas.height);

    for (let i = 0; i < lhs.data.length; i += 4) {
      diffImageData.data[i] = Math.abs(lhs.data[i] - rhs.data[i]);
      diffImageData.data[i + 1] = Math.abs(lhs.data[i + 1] - rhs.data[i + 1]);
      diffImageData.data[i + 2] = Math.abs(lhs.data[i + 2] - rhs.data[i + 2]);
      diffImageData.data[i + 3] = Math.abs(255 - Math.abs(lhs.data[i + 3] - rhs.data[i + 3]));
    }

    const canvas = new Canvas(lhsCanvas.width, lhsCanvas.height);
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

    const imageBasePath = `${this._options.outputDir}/${this._options.browserIdentifier}/${this._currentSuite.description}/${spec.description}`;

    if (spec.failedExpectations.length === 0) {
      this._storeScreenShot(imageBasePath);
    }

    const failedViewerDataExpectations = spec.failedExpectations.filter(
      expectation => expectation.matcherName === 'toEqualDrawingStack'
    );

    failedViewerDataExpectations.forEach((expectation, index) => {
      let expectationPathSegment = '';

      if (failedViewerDataExpectations.length > 1) {
        expectationPathSegment = `/${index}`;
      }

      const expectationImagePath = `${imageBasePath}${expectationPathSegment}`;
      mkdirp.sync(expectationImagePath);

      const expectedDrawingStack = expectation.expected;
      const actualDrawingStack = expectation.actual;


      const renderer = new CanteenStackRenderer();
      const expectedCanvas = renderer.render(expectedDrawingStack);
      const actualCanvas = renderer.render(actualDrawingStack);

      const diffCanvas = this._canvasDiff(expectedCanvas, actualCanvas);

      this._storeCanvas(expectationImagePath + '/actual.png', actualCanvas);
      this._storeCanvas(expectationImagePath + '/expected.png', expectedCanvas);
      this._storeCanvas(expectationImagePath + '/diff.png', diffCanvas);
    });
  }
}

export default ImageDiffReporter;
