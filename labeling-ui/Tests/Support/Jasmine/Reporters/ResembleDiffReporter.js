import mkdirp from 'mkdirp';
import fs from 'fs';
import path from 'path';
import Canvas, {ImageData} from 'canvas';

/**
 * Jasmine reporter for visualizing image diffs created with resemble
 */
class ResembleDiffReporter {
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

  specDone(spec) {
    if (spec.status === 'disabled') {
      return;
    }

    const imageBasePath = `${this._options.outputDir}/${this._options.browserIdentifier}/${this._currentSuite.description}/${spec.description}`;

    const matchBelowThresholdExpectations = spec.failedExpectations.filter(
      expectation => {
        switch (expectation.matcherName) {
          case 'toMatchBelowThreshold':
            return true;
          default:
            return false;
        }
      }
    );

    matchBelowThresholdExpectations.forEach((expectation, index) => {
      let expectationPathSegment = '';

      if (matchBelowThresholdExpectations.length > 1) {
        expectationPathSegment = `/${index}`;
      }

      const expectationImagePath = `${imageBasePath}${expectationPathSegment}`;
      mkdirp.sync(expectationImagePath);

      const diff = expectation.actual;
      diff.getDiffImage().pack().pipe(fs.createWriteStream(expectationImagePath + '/diff.png'));
      fs.writeFileSync(expectationImagePath + '/actual.png', diff.actualPng);
      fs.writeFileSync(expectationImagePath + '/expected.png', diff.expectedPng);
    });
  }
}

export default ResembleDiffReporter;
